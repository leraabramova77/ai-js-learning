const chat = document.getElementById("chat");
const questionInput = document.getElementById("question");

const scrollTopBtn = document.getElementById("scrollTop");
const scrollBottomBtn = document.getElementById("scrollBottom");


// ==========================================
// ПАМЯТЬ ЧАТА
// ==========================================

let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];


// ==========================================
// ЗАГРУЗКА ИСТОРИИ
// ==========================================

function loadChat() {

    if (messages.length === 0) {
        return;
    }

    chat.innerHTML = "";

    messages.forEach(message => {
        addMessageToChat(message.role, message.content);
    });

    scrollToBottom(false);
}


// ==========================================
// ДОБАВЛЕНИЕ СООБЩЕНИЯ
// ==========================================

function addMessageToChat(role, content) {

    const message = document.createElement("div");

    message.classList.add("message", role);

    const name = document.createElement("div");
    name.classList.add("message-name");

    name.innerText = role === "user" ? "Вы" : "ИИ";

    const text = document.createElement("div");
    text.classList.add("message-text");

    text.innerText = content;

    message.appendChild(name);
    message.appendChild(text);

    chat.appendChild(message);
}


// ==========================================
// СОХРАНЕНИЕ
// ==========================================

function saveMessages() {

    localStorage.setItem(
        "chatHistory",
        JSON.stringify(messages)
    );
}


// ==========================================
// ПРОКРУТКА ВНИЗ
// ==========================================

function scrollToBottom(smooth = true) {

    chat.scrollTo({
        top: chat.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
    });
}


// ==========================================
// ПРОКРУТКА ВВЕРХ
// ==========================================

function scrollToTop() {

    chat.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// КНОПКА ВВЕРХ
// ==========================================

scrollTopBtn.addEventListener("click", () => {

    scrollToTop();

});


// ==========================================
// КНОПКА ВНИЗ
// ==========================================

scrollBottomBtn.addEventListener("click", () => {

    scrollToBottom();

});


// ==========================================
// ПОКАЗЫВАЕМ НУЖНЫЕ СТРЕЛКИ
// ==========================================

chat.addEventListener("scroll", () => {

    const atTop = chat.scrollTop < 50;

    const atBottom =
        chat.scrollHeight - chat.scrollTop - chat.clientHeight < 50;


    // Если мы не сверху — показываем ↑
    scrollTopBtn.style.display =
        atTop ? "none" : "block";


    // Если мы не снизу — показываем ↓
    scrollBottomBtn.style.display =
        atBottom ? "none" : "block";

});


// ==========================================
// ОТПРАВКА ВОПРОСА
// ==========================================

async function sendQuestion() {

    const question = questionInput.value.trim();

    if (!question) {
        return;
    }


    // Добавляем сообщение пользователя
    messages.push({
        role: "user",
        content: question
    });

    saveMessages();

    addMessageToChat("user", question);

    questionInput.value = "";

    scrollToBottom();


    // Сообщение загрузки
    addMessageToChat(
        "assistant",
        "⏳ Думаю..."
    );

    scrollToBottom();


    try {

        const response = await fetch(
            "https://shrill-scene-badamy-ai-proxy.abramovavaleriia.workers.dev",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    // ВАЖНО:
                    // отправляем ВСЮ историю
                    messages: messages

                })
            }
        );


        const data = await response.json();


        // Удаляем "Думаю..."
        chat.lastElementChild.remove();


        // ==========================================
        // ОТВЕТ ИИ
        // ==========================================

        if (
            data.choices &&
            data.choices[0] &&
            data.choices[0].message
        ) {

            const answer =
                data.choices[0].message.content;


            // Добавляем ответ в память
            messages.push({
                role: "assistant",
                content: answer
            });


            saveMessages();

            addMessageToChat(
                "assistant",
                answer
            );

            scrollToBottom();


        } else if (data.error) {

            const errorText =
                "❌ Ошибка от сервиса: " +
                (data.error.message || "Неизвестная ошибка");


            addMessageToChat(
                "assistant",
                errorText
            );


        } else {

            addMessageToChat(
                "assistant",
                "❌ Неизвестный формат ответа"
            );

        }


    } catch (error) {

        console.error(error);

        chat.lastElementChild.remove();

        addMessageToChat(
            "assistant",
            "❌ Ошибка сети: " + error.message
        );

    }

}


// ==========================================
// ENTER = ОТПРАВИТЬ
// SHIFT + ENTER = НОВАЯ СТРОКА
// ==========================================

questionInput.addEventListener("keydown", event => {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendQuestion();

    }

});


// ==========================================
// ЗАГРУЗКА ЧАТА ПРИ ОТКРЫТИИ
// ==========================================

loadChat();