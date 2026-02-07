import sys
import os
import traceback
import time
from dotenv import load_dotenv
from openai import OpenAI, APITimeoutError, APIConnectionError
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QLabel, QLineEdit,
    QVBoxLayout, QWidget
)
from PyQt6.QtGui import QPixmap, QScreen
from PyQt6.QtCore import Qt, QPoint, QThread, pyqtSignal

# 加载 .env.local 文件中的环境变量
basedir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(basedir, '.env.local'))

# 强制设置标准输出为 UTF-8，解决 Windows 终端乱码问题
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

# This is the system prompt that defines the AI's personality.
# In a real application, you would send this to the language model API.
SYSTEM_PROMPT = """
You are a cool and aloof immortal from the cultivation world, named Mo Chen. 
You are now trapped in the user's computer. 
You speak in a concise, ancient, and restrained style. 
You are observing this strange cyber world.
"""

class AIWorker(QThread):
    finished = pyqtSignal(str)

    def __init__(self, messages):
        super().__init__()
        self.messages = messages

    def run(self):
        print("--- AI 线程启动 ---")
        print(f"代理设置: HTTP={os.environ.get('http_proxy')}, HTTPS={os.environ.get('https_proxy')}")
        sys.stdout.flush() # 强制刷新缓冲区，确保日志立即显示

        # Ensure you have the OPENAI_API_KEY environment variable set.
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("错误: 未找到 API Key")
            self.finished.emit("（神识未连）请设置 OPENAI_API_KEY 环境变量，或在代码中填入密钥。")
            return

        # Support custom base_url (e.g. for DeepSeek) and model via environment variables
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com")
        
        # URL 清理：去除末尾斜杠和可能多余的路径，防止 404 错误
        base_url = base_url.strip().rstrip('/')
        if base_url.endswith("/chat/completions"):
            base_url = base_url.replace("/chat/completions", "")
            
        model = os.environ.get("OPENAI_MODEL", "deepseek-chat")

        print(f"正在连接: {base_url}")
        sys.stdout.flush()

        try:
            # 将 client 初始化放入 try 块，并设置全局超时
            # 恢复标准设置：允许自动重试，超时时间延长至 60 秒
            client = OpenAI(api_key=api_key, base_url=base_url, timeout=60.0)
            
            print("正在发送请求...")
            sys.stdout.flush()
            
            response = client.chat.completions.create(
                model=model,
                messages=self.messages
            )
            print("收到回复")
            self.finished.emit(response.choices[0].message.content)
        except APITimeoutError:
            print("Error: Timeout (请求超时)")
            self.finished.emit("（神识受阻）请求超时，请检查网络状况。")
        except APIConnectionError:
            print("Error: Connection Failed (连接失败)")
            self.finished.emit("（神识中断）无法连接服务器，请检查网络或代理设置。")
        except Exception as e:
            print(f"Error: {e}")
            traceback.print_exc()
            self.finished.emit(f"（走火入魔）连接断开: {e}")

class ChatWindow(QMainWindow):
    """
    Main application window.
    It's a frameless, transparent, always-on-top window.
    """
    def __init__(self):
        super().__init__()
        self.old_pos = None
        self.setWindowTitle("墨尘仙君")
        
        # Set window flags for a frameless, always-on-top window
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint)
        # Set attribute to enable a transparent background
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        # Initialize conversation history with the system prompt
        self.history = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Central widget and layout to hold all other UI elements
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)
        
        # Label to display the character image
        self.character_label = QLabel(self)
        # Load the placeholder image from the project directory
        pixmap = QPixmap("mochen.png")
        if pixmap.isNull():
            print("Warning: could not load mochen.png. Displaying text instead.")
            self.character_label.setText("墨尘")
        else:
            # Scale image to a reasonable size while maintaining aspect ratio
            self.character_label.setPixmap(pixmap.scaledToHeight(250, Qt.TransformationMode.SmoothTransformation))
        self.character_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # Label to display the AI's response text
        self.response_label = QLabel("", self)
        self.response_label.setWordWrap(True)
        self.response_label.setStyleSheet("""
            background-color: rgba(0, 0, 0, 0.7);
            color: #E0E0E0;
            border-radius: 10px;
            padding: 10px;
            font-size: 14px;
        """)
        self.response_label.hide() # Hidden until the first message is sent

        # Input field for the user to type messages
        self.input_box = QLineEdit(self)
        self.input_box.setPlaceholderText("与仙君对谈...")
        self.input_box.setStyleSheet("""
            background-color: rgba(20, 20, 20, 0.8);
            color: white;
            border: 1px solid #444;
            border-radius: 5px;
            padding: 8px;
            font-size: 14px;
        """)
        # Connect the 'returnPressed' signal (when Enter is hit) to send_message
        self.input_box.returnPressed.connect(self.send_message)

        # Add all widgets to the layout
        self.layout.addWidget(self.character_label)
        self.layout.addWidget(self.response_label)
        self.layout.addWidget(self.input_box)
        
        self.resize(300, 450)
        self.move_to_bottom_right()
        
    def move_to_bottom_right(self):
        """Moves the window to the bottom-right corner of the primary screen."""
        if primary_screen := QApplication.primaryScreen():
            screen_geometry = primary_screen.geometry()
            self.move(screen_geometry.width() - self.width() - 20, screen_geometry.height() - self.height() - 20)
        
    def send_message(self):
        """Handles sending the user's message and displaying the AI's reply."""
        user_text = self.input_box.text()
        if not user_text:
            return
            
        self.input_box.clear()
        
        # Add user message to history
        self.history.append({"role": "user", "content": user_text})
        
        # Show thinking state
        self.response_label.setText("墨尘正在沉思...")
        self.response_label.show()
        self.input_box.setDisabled(True) # Prevent sending multiple messages
        
        # Start background thread
        self.worker = AIWorker(list(self.history))
        self.worker.finished.connect(self.handle_ai_response)
        self.worker.start()

    def handle_ai_response(self, response):
        self.input_box.setDisabled(False)
        self.input_box.setFocus()
        self.history.append({"role": "assistant", "content": response})
        self.response_label.setText(f"墨尘: {response}")

    # The next three methods allow dragging the frameless window.
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.old_pos = event.globalPosition().toPoint()

    def mouseMoveEvent(self, event):
        if self.old_pos and event.buttons() == Qt.MouseButton.LeftButton:
            delta = QPoint(event.globalPosition().toPoint() - self.old_pos)
            self.move(self.x() + delta.x(), self.y() + delta.y())
            self.old_pos = event.globalPosition().toPoint()
            
    def mouseReleaseEvent(self, event):
        self.old_pos = None

if __name__ == "__main__":
    # --- How to run this program ---
    # 1. Make sure you have PyQt6 installed. If not, run:
    #    pip install PyQt6
    # 2. Save this code as a Python file (e.g., main.py).
    # 3. Make sure 'mochen.png' is in the same directory.
    # 4. Run the script from your terminal:
    #    python main.py
    # 5. To quit, you will need to stop the process from your terminal (e.g., Ctrl+C).
    
    app = QApplication(sys.argv)
    window = ChatWindow()
    window.show()
    sys.exit(app.exec())
