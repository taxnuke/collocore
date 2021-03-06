#!/usr/bin/env node

'use strict';

const
  TRELLO_TOKEN = argFinder('--token'),
  TRELLO_KEY = argFinder('--key'),
  TRELLO_LIST = argFinder('--list'),
  ENUMERATE_TICKETS = argFinder('-n'),
  FILE_WITH_TICKETS = argFinder('--file');

const
  https = require('https'),
  readLine = require('readline'),
  fs = require('fs');

let
  tickets = [],
  currentTicketNumber = 0;

if (!FILE_WITH_TICKETS) {
  console.error('Нужен .txt-файл с билетами');
  process.exit(1);
}

readLine.createInterface({input: fs.createReadStream(FILE_WITH_TICKETS)})
  .on('line', (subject) => {
    if (!subject.startsWith('#')) {
      tickets.push(subject)
    }
  })
  .on('close', () => {
    postNextTicketToTrello();
  });

function postNextTicketToTrello() {
  const nextTicket = tickets.shift();
  ++currentTicketNumber;

  if (nextTicket) {
    addNewTicketToTrello(nextTicket, postNextTicketToTrello);
  } else {
    console.log('Все билеты добавлены в Trello!');
  }
}

/**
 * @param {string}   subject  Тема
 * @param {string}   details  Описание
 * @param {function} callback Коллбэк, вызываемый после добавления билета
 */
function addNewTicketToTrello(subject, callback) {
  const cardName = ENUMERATE_TICKETS ? `${currentTicketNumber}. ` + subject : subject;

  addCard(
    cardName,
    null,
    TRELLO_LIST,
    null,
    'bottom',
    callback
  );
}

/**
 * @param {string}   name     Название карточки
 * @param {string}   desc     Описание
 * @param {string}   idList   ID списка
 * @param {string}   idLabels ID тегов
 * @param {string}   pos      Положение в списке ('top' или 'bottom')
 * @param {function} callback Коллбэк, вызываемый после добавления карточки
 */
function addCard(name, desc, idList, idLabels, pos, callback) {
  sendRequest('/cards', { name, desc, idList, idLabels, pos }, callback);
  // Для отладки
  // console.debug(name);
  // callback();
}

/**
 * @param {string}   route    Маршрут API
 * @param {object}   data     Данные в теле запроса
 * @param {function} callback Коллбэк, вызываемый после отправки запроса
 */
function sendRequest(route, data, callback) {
  const
    BASE_URL = 'api.trello.com',
    API_V = 1;

  const options = {
    host: BASE_URL,
    path: '/' + API_V + route + '?key=' + TRELLO_KEY + '&token=' + TRELLO_TOKEN,
    port: 443,
    method: 'POST'
  };

  const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (res.statusCode !== 200) {
          if (res.statusCode === 401 || res.statusCode === 400) {
            switch (chunk) {
              case 'invalid key':
                console.error('Неверный API-ключ'); break;
              case 'invalid value for idList':
                console.error('Неверный ID списка'); break;
              case 'invalid token':
                console.error('Неверный токен'); break;
              default:
                console.error(chunk); break;
            }
          } else {
            console.log('Status: ' + res.statusCode);
            console.log('Body: ' + chunk);
            console.log('Data: ' + JSON.stringify(data));
          }

          process.exit(1);
        } else {
          callback();
        }
      });
    })
    .on('error', (e) => {
      console.log('Что-то пошло очень не так: ' + e.message);

      process.exit(1);
    });

  req.setHeader('Content-Type', 'application/json');
  req.write(JSON.stringify(data));
  req.end();
}

/**
 * @param {string} key Искомый аргумент
 */
function argFinder(key) {
  if (key.startsWith('--')) {
    const keyPosition = process.argv.findIndex((argument) => {
      return argument === key;
    });

    if (keyPosition !== -1) {
      return process.argv[keyPosition + 1];
    }
  } else {
    return process.argv.includes(key);
  }
}
