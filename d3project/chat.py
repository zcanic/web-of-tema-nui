import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QListWidget, QLineEdit, QPushButton, QDialog, QFormLayout, 
                             QTextEdit, QDoubleSpinBox, QLabel, QGraphicsDropShadowEffect)
from PyQt5.QtCore import Qt, QSettings
from PyQt5.QtGui import QColor
import openai

# 设置对话框类
class SettingsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("设置")
        self.resize(400, 300)
        self.layout = QFormLayout(self)

        # API Base 输入框
        self.api_base_edit = QLineEdit()
        self.api_base_edit.setPlaceholderText("请输入 API Base")
        self.api_base_edit.setText(parent.api_base)

        # API Key 输入框
        self.api_key_edit = QLineEdit()
        self.api_key_edit.setPlaceholderText("请输入 API Key")
        self.api_key_edit.setText(parent.api_key)

        # System Prompt 输入框
        self.system_prompt_edit = QTextEdit()
        self.system_prompt_edit.setPlaceholderText("请输入 System Prompt")
        self.system_prompt_edit.setText(parent.system_prompt)

        # Temperature 调整框
        self.temperature_spin = QDoubleSpinBox()
        self.temperature_spin.setRange(0.0, 1.0)
        self.temperature_spin.setSingleStep(0.1)
        self.temperature_spin.setValue(parent.temperature)

        # 保存按钮
        self.save_button = QPushButton("保存")
        self.save_button.setStyleSheet("""
            QPushButton {
                background-color: #007bff;
                color: #ffffff;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
            }
            QPushButton:hover {
                background-color: #0056b3;
            }
        """)
        self.save_button.clicked.connect(self.save_settings)

        # 添加到布局
        self.layout.addRow("API Base:", self.api_base_edit)
        self.layout.addRow("API Key:", self.api_key_edit)
        self.layout.addRow("System Prompt:", self.system_prompt_edit)
        self.layout.addRow("Temperature:", self.temperature_spin)
        self.layout.addRow(self.save_button)

    def save_settings(self):
        settings = QSettings("MyCompany", "ChatBox")
        settings.setValue("api_base", self.api_base_edit.text())
        settings.setValue("api_key", self.api_key_edit.text())
        settings.setValue("system_prompt", self.system_prompt_edit.toPlainText())
        settings.setValue("temperature", self.temperature_spin.value())
        self.accept()

# 主窗口类
class ChatBox(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ChatGPT Chatbox")
        self.setGeometry(100, 100, 600, 500)

        # 加载设置
        settings = QSettings("MyCompany", "ChatBox")
        self.api_base = settings.value("api_base", "https://api.openai.com/v1")
        self.api_key = settings.value("api_key", "")
        self.system_prompt = settings.value("system_prompt", "You are a helpful assistant.")
        self.temperature = float(settings.value("temperature", 0.7))

        # 创建中央 widget 和渐变背景
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.central_widget.setStyleSheet("""
            QWidget {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #f0f0f0, stop:1 #ffffff);
            }
        """)

        # 主布局
        self.layout = QVBoxLayout(self.central_widget)

        # 顶部布局（设置按钮）
        self.top_layout = QHBoxLayout()
        self.settings_button = QPushButton("设置")
        self.settings_button.setStyleSheet("""
            QPushButton {
                background-color: #007bff;
                color: #ffffff;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
            }
            QPushButton:hover {
                background-color: #0056b3;
            }
        """)
        self.settings_button.clicked.connect(self.open_settings)
        self.top_layout.addWidget(self.settings_button)
        self.top_layout.addStretch()
        self.layout.addLayout(self.top_layout)

        # 对话区域
        self.chat_list = QListWidget()
        self.chat_list.setStyleSheet("""
            QListWidget {
                background-color: #f0f0f0;
                border: none;
                padding: 10px;
            }
        """)
        self.chat_list.setMinimumHeight(400)
        self.layout.addWidget(self.chat_list)

        # 输入区域
        self.input_layout = QHBoxLayout()
        self.input_edit = QLineEdit()
        self.input_edit.setPlaceholderText("请输入消息...")
        self.input_edit.setStyleSheet("""
            QLineEdit {
                background-color: #ffffff;
                border: 1px solid #cccccc;
                border-radius: 5px;
                padding: 5px;
            }
        """)
        self.input_edit.setFixedHeight(50)
        self.input_layout.addWidget(self.input_edit)

        self.send_button = QPushButton("发送")
        self.send_button.setStyleSheet("""
            QPushButton {
                background-color: #007bff;
                color: #ffffff;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
            }
            QPushButton:hover {
                background-color: #0056b3;
            }
        """)
        self.send_button.setFixedHeight(50)
        self.send_button.clicked.connect(self.send_message)
        self.input_layout.addWidget(self.send_button)

        self.layout.addLayout(self.input_layout)

    def open_settings(self):
        dialog = SettingsDialog(self)
        if dialog.exec_():
            settings = QSettings("MyCompany", "ChatBox")
            self.api_base = settings.value("api_base", "https://api.openai.com/v1")
            self.api_key = settings.value("api_key", "")
            self.system_prompt = settings.value("system_prompt", "You are a helpful assistant.")
            self.temperature = float(settings.value("temperature", 0.7))

    def send_message(self):
        message = self.input_edit.text()
        if not message:
            return
        self.input_edit.clear()

        # 添加用户消息
        user_label = QLabel(message)
        user_label.setWordWrap(True)
        user_label.setStyleSheet("""
            QLabel {
                background-color: #e6f7ff;
                border-radius: 10px;
                padding: 10px;
            }
        """)
        user_label.setAlignment(Qt.AlignRight)
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(10)
        shadow.setColor(QColor(0, 0, 0, 50))
        shadow.setOffset(0, 0)
        user_label.setGraphicsEffect(shadow)
        item = QListWidgetItem()
        item.setSizeHint(user_label.sizeHint())
        self.chat_list.addItem(item)
        self.chat_list.setItemWidget(item, user_label)

        # 调用 OpenAI API
        openai.api_base = self.api_base
        openai.api_key = self.api_key
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=self.temperature
            )
            reply = response.choices[0].message["content"]
        except Exception as e:
            reply = f"错误: {str(e)}"

        # 添加 ChatGPT 消息
        assistant_label = QLabel(reply)
        assistant_label.setWordWrap(True)
        assistant_label.setStyleSheet("""
            QLabel {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 10px;
            }
        """)
        assistant_label.setAlignment(Qt.AlignLeft)
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(10)
        shadow.setColor(QColor(0, 0, 0, 50))
        shadow.setOffset(0, 0)
        assistant_label.setGraphicsEffect(shadow)
        item = QListWidgetItem()
        item.setSizeHint(assistant_label.sizeHint())
        self.chat_list.addItem(item)
        self.chat_list.setItemWidget(item, assistant_label)

        # 自动滚动到底部
        self.chat_list.scrollToBottom()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ChatBox()
    window.show()
    sys.exit(app.exec_())