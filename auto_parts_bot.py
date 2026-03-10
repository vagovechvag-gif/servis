import os
import asyncio
import logging
from datetime import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Получение токена бота и ID менеджера из переменных окружения
BOT_TOKEN = os.getenv("BOT_TOKEN")
MANAGER_ID = int(os.getenv("MANAGER_ID", 0))  # ID менеджера для получения заявок

if not BOT_TOKEN:
    raise ValueError("Необходимо указать BOT_TOKEN в переменной окружения или в файле .env")

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# Класс состояний для машины состояний (FSM)
class PartsRequest(StatesGroup):
    waiting_for_brand = State()
    waiting_for_model = State()
    waiting_for_year = State()
    waiting_for_vin_or_photo = State()


# Главное меню с кнопками
def get_main_keyboard():
    keyboard = [
        [KeyboardButton(text="🔧 Подобрать автозапчасть")],
        [KeyboardButton(text="📞 Связаться с менеджером")]
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


# Обработчик команды /start
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(
        "Добро пожаловать в магазин автозапчастей! 🚗\n\n"
        "Я помогу вам подобрать необходимые запчасти.\n"
        "Выберите действие:",
        reply_markup=get_main_keyboard()
    )


# Обработчик кнопки "Подобрать автозапчасть"
@dp.message(F.text == "🔧 Подобрать автозапчасть")
async def start_parts_request(message: types.Message, state: FSMContext):
    await state.clear()
    await state.set_state(PartsRequest.waiting_for_brand)
    await message.answer(
        "Отлично! Давайте начнем подбор запчасти.\n\n"
        "Введите **марку автомобиля** (например: Toyota, BMW, Mercedes):",
        parse_mode="Markdown"
    )


# Обработчик ввода марки автомобиля
@dp.message(PartsRequest.waiting_for_brand)
async def process_brand(message: types.Message, state: FSMContext):
    if not message.text or len(message.text) > 50:
        await message.answer("Пожалуйста, введите корректную марку автомобиля:")
        return
    
    await state.update_data(brand=message.text.strip())
    await state.set_state(PartsRequest.waiting_for_model)
    await message.answer(
        f"Марка: {message.text}\n\n"
        "Теперь введите **модель автомобиля** (например: Camry, X5, C-Class):",
        parse_mode="Markdown"
    )


# Обработчик ввода модели автомобиля
@dp.message(PartsRequest.waiting_for_model)
async def process_model(message: types.Message, state: FSMContext):
    if not message.text or len(message.text) > 100:
        await message.answer("Пожалуйста, введите корректную модель автомобиля:")
        return
    
    await state.update_data(model=message.text.strip())
    await state.set_state(PartsRequest.waiting_for_year)
    await message.answer(
        f"Модель: {message.text}\n\n"
        "Введите **год выпуска** автомобиля (например: 2015, 2020):",
        parse_mode="Markdown"
    )


# Обработчик ввода года выпуска
@dp.message(PartsRequest.waiting_for_year)
async def process_year(message: types.Message, state: FSMContext):
    year = message.text.strip()
    
    # Проверка, что год - это число от 1900 до текущего года + 1
    current_year = datetime.now().year
    try:
        year_int = int(year)
        if year_int < 1900 or year_int > current_year + 1:
            raise ValueError
    except ValueError:
        await message.answer(
            f"Пожалуйста, введите корректный год выпуска (от 1900 до {current_year + 1}):"
        )
        return
    
    await state.update_data(year=year)
    await state.set_state(PartsRequest.waiting_for_vin_or_photo)
    await message.answer(
        f"Год выпуска: {year}\n\n"
        "Теперь отправьте **VIN номер** автомобиля текстом или **фото техпаспорта**.\n"
        "Вы можете отправить VIN сейчас или пропустить этот шаг, нажав кнопку ниже.",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⏭ Пропустить VIN", callback_data="skip_vin")]
        ])
    )


# Обработчик пропуска VIN
@dp.callback_query(F.data == "skip_vin", PartsRequest.waiting_for_vin_or_photo)
async def skip_vin(callback: types.CallbackQuery, state: FSMContext):
    await send_request_to_manager(
        state, 
        callback.bot, 
        callback.from_user.id, 
        callback.from_user.username
    )
    await callback.message.answer(
        "✅ Ваша заявка успешно отправлена!\n\n"
        "Наш менеджер свяжется с вами в ближайшее время.",
        reply_markup=get_main_keyboard()
    )
    await state.clear()


# Обработчик VIN номера (текст)
@dp.message(PartsRequest.waiting_for_vin_or_photo, F.text)
async def process_vin(message: types.Message, state: FSMContext):
    vin = message.text.strip()
    
    if len(vin) < 5:
        await message.answer("VIN номер слишком короткий. Пожалуйста, проверьте правильность ввода:")
        return
    
    await state.update_data(vin=vin)
    await send_request_to_manager(
        state, 
        message.bot, 
        message.from_user.id, 
        message.from_user.username
    )
    await message.answer(
        "✅ Ваша заявка успешно отправлена!\n\n"
        "Наш менеджер свяжется с вами в ближайшее время.",
        reply_markup=get_main_keyboard()
    )
    await state.clear()


# Обработчик фото техпаспорта
@dp.message(PartsRequest.waiting_for_vin_or_photo, F.photo)
async def process_photo(message: types.Message, state: FSMContext):
    # Получаем фото в максимальном разрешении (последнее в списке)
    photo = message.photo[-1]
    await state.update_data(photo_file_id=photo.file_id)
    await send_request_to_manager(
        state, 
        message.bot, 
        message.from_user.id, 
        message.from_user.username
    )
    await message.answer(
        "✅ Ваша заявка успешно отправлена!\n\n"
        "Наш менеджер свяжется с вами в ближайшее время.",
        reply_markup=get_main_keyboard()
    )
    await state.clear()


# Функция отправки заявки менеджеру
async def send_request_to_manager(state: FSMContext, bot_instance: Bot, user_id: int, username: str = None):
    if MANAGER_ID == 0:
        logging.warning("MANAGER_ID не указан, заявка не будет отправлена менеджеру")
        return
    
    data = await state.get_data()
    
    # Формируем текст заявки
    request_text = (
        "🆕 **Новая заявка на подбор запчасти**\n\n"
        f"🚗 **Марка:** {data.get('brand', 'Не указано')}\n"
        f"📋 **Модель:** {data.get('model', 'Не указано')}\n"
        f"📅 **Год выпуска:** {data.get('year', 'Не указано')}\n"
    )
    
    if data.get('vin'):
        request_text += f"🔢 **VIN:** {data.get('vin')}\n"
    
    if data.get('photo_file_id'):
        request_text += "📷 **Фото техпаспорта:** Прикреплено\n"
    
    request_text += (
        f"\n👤 **Клиент:** @{username if username else 'нет username'}\n"
        f"🆔 **ID:** `{user_id}`\n"
        f"🕒 **Дата:** {datetime.now().strftime('%d.%m.%Y %H:%M')}"
    )
    
    # Отправляем текстовую часть заявки менеджеру
    try:
        # Пробуем отправить текст
        await bot_instance.send_message(
            chat_id=MANAGER_ID,
            text=request_text,
            parse_mode="Markdown"
        )
        
        # Если есть фото, отправляем его
        if data.get('photo_file_id'):
            await bot_instance.send_photo(
                chat_id=MANAGER_ID,
                photo=data['photo_file_id'],
                caption=f"Фото техпаспорта для заявки\nМарка: {data.get('brand')} Модель: {data.get('model')}"
            )
        
        logging.info(f"Заявка отправлена менеджеру (ID: {MANAGER_ID})")
        
    except Exception as e:
        logging.error(f"Ошибка при отправке заявки менеджеру: {e}")


# Обработчик кнопки "Связаться с менеджером"
@dp.message(F.text == "📞 Связаться с менеджером")
async def contact_manager(message: types.Message):
    if MANAGER_ID == 0:
        await message.answer(
            "К сожалению, в данный момент связь с менеджером недоступна.\n"
            "Попробуйте позже или позвоните нам по телефону."
        )
        return
    
    await message.answer(
        f"Для связи с менеджером вы можете:\n\n"
        f"• Написать напрямую: @{(await bot.get_chat(MANAGER_ID)).username if (await bot.get_chat(MANAGER_ID)).username else 'недоступно'}\n"
        f"• Оставить заявку через кнопку 'Подобрать автозапчасть'\n\n"
        f"Наш менеджер ответит вам в ближайшее время!",
        reply_markup=get_main_keyboard()
    )


# Обработчик всех остальных сообщений (когда пользователь не в состоянии заполнения заявки)
@dp.message(~StateFilter(PartsRequest))
async def handle_other_messages(message: types.Message):
    await message.answer(
        "Пожалуйста, выберите одно из действий в меню:",
        reply_markup=get_main_keyboard()
    )


# Основной цикл запуска бота
async def main():
    logging.info("Бот запущен...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Бот остановлен пользователем")
