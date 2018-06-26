const BotParent = require('vk-botlongpoll');
const GROUPS = {
	main: {
		name: 'Общий',
		members: [164124208, 165854518],
		color: 'positive'
	},
	js: {
		name: 'Javascript',
		members: [164124208],
		color: 'primary'
	},
	php: {
		name: 'PHP',
		members: [165854518],
		color: 'primary'
	},
	finance: {
		name: 'Финансовый',
		members: [164124208, 165854518],
		color: 'negative'
	}
};


var Users = []; // Юзеры которые нам писали

var users = new Map;



class BotHelper extends BotParent {
	sendKeyboard(reply, from_id) {
		// users.set(from_id, undefined);
		reply("Привет!", "", {
			"one_time": false,
			"buttons": [
				[{
					"action": {
						"type": "text",
						"payload": "{\"button\": \"question\"}",
						"label": "У меня есть вопрос"
					},
					"color": "default"
				}]
			]
		});
	}
}

const botHelper = new BotHelper({
	'language': 'ru',
	'token': '',
	'groupId': 162550260,
	'commandDivider': '.',
	'autoRead': true,
	'getInfoAboutUser': true
});


var Buttons = {
	"one_time": true,
	"buttons": []
}


{ // Чтобы не засорять область видимости
	let buttonsArray = [];
	for (let id in GROUPS) {
		let group = GROUPS[id];
		buttonsArray.push({
			"action": {
				"type": "text",
				"payload": `{"type": "${id}"}`,
				"label": group.name
			},
			"color": group.color
		});
		console.log(group)
	}
	Buttons.buttons.push(buttonsArray);
}



botHelper.onMessageWithoutEvent(async ({reply, text, payload, from_id})=>{
	if (users.get(from_id) && users.get(from_id).action == 'waitQuestion') {
		
		await reply('Куда вы хотите задать вопрос?', "", Buttons);

		users.set(from_id, {
			action: 'selectCategory',
			question: text
		});
	}
	// reply(`Да`);
});

botHelper.onMessage(({reply, text, payload, from_id})=>{

	if (users.get(from_id) && users.get(from_id).action == 'selectCategory'){
		try{
			var type = JSON.parse(payload).type;
			GROUPS[type].members.forEach(id=>botHelper.api.sendMessage(id, `Получен новый вопрос по теме ${type}! Вопрос: \n\n ${users.get(from_id).question}`))

		}
		catch(e){
			reply(`Произошла ошибка: ${JSON.stringify(e)}`);
		}
		
		// GROUPS[type].members.forEach(id=>botHelper.api.sendMessage(id, `Получен новый вопрос по теме ${type}! Вопрос: \n\n ${users.get(from_id).question}`))
		reply("Спасибо, ваш вопрос был отправлен =)", 0, {
			"one_time": false,
			"buttons": [
				[{
					"action": {
						"type": "text",
						"payload": "{\"button\": \"question\"}",
						"label": "У меня есть вопрос"
					},
					"color": "default"
				}]
			]
		});
		return true;
	}

	if(Users.includes(from_id)) return; // Пользователь уже писал нам, не отправляем клавиатуру
	botHelper.sendKeyboard(reply, from_id);
	Users.push(from_id);
});


botHelper.onPayload({button:"question"}, ({reply, text, payload, from_id})=>{
	reply('Отлично, напишите пожалуйста ваш вопрос');
	users.set(from_id, {action:'waitQuestion'});
	console.log(users);
});

botHelper.onPayload({"command":"start"}, ({reply, text, payload, from_id})=>{
	reply(`Возникли проблемы? Обращайтесь к нам, и мы решим его в ближайшее время.
Время работы тех поддержки с 9:00 до 22:00`, '', {
			"one_time": false,
			"buttons": [
				[{
					"action": {
						"type": "text",
						"payload": "{\"button\": \"question\"}",
						"label": "У меня есть вопрос"
					},
					"color": "default"
				}]
			]
		});
});


console.log(Buttons);

