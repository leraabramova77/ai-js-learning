function sendQuestion() {
    const question = document.getElementById('question').value.trim();
    const answerBox = document.getElementById('answer');

    if (!question) {
        answerBox.innerText = '❌ Напиши вопрос!';
        return;
    }

    answerBox.innerText = '⏳ Думаю...';

   fetch('https://shrill-scene-badamy-ai-proxy.abramovavaleriia.workers.dev', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        question: question
    })
})
    .then(response => response.json())
    .then(data => {
        // Извлечение ответа под формат OpenRouter
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const answer = data.choices[0].message.content;
            answerBox.innerText = answer;
        } else if (data.error) {
            answerBox.innerText = '❌ Ошибка от сервиса: ' + data.error.message;
        } else {
            answerBox.innerText = '❌ Неизвестный формат ответа';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        answerBox.innerText = '❌ Ошибка сети: ' + error.message;
    });
}