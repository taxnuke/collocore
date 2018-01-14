## Ядро для коллоквиумов и прочих экзаменов в LaTeX

Ядро обновляется отдельно от проектов, обратная совместимость не гарантируется, поэтому если какой-то проект использует более старую версию, то лучше её и использовать.

### Назначение директорий и точки подключения библиотек и тд.

|    Файл        |                       Роль                                  |
| :------------: | :---------------------------------------------------------: |
| `core.tex`     | самый главный файл, совершает все импорты и вызовы          |
| `packages.tex` | подключает всякие зависимости, окружения LaTeX              |
| `custom.tex`   | для кастомных макросов, логики ядра и блоков текста         |
| `structs.tex`  | форматы нумерации и всё, что определяет структуру документа |

### Конфигурирование
Чтобы всё работало, у проекта, который это ядро использует, должен быть файл `config.tex`. Примерное содержание данного файла:

```
%============================НАСТРОЙКИ============================
\def \startTicket{1} % С какого билета начать
\def \endTicket{8}   % Каким билетом закончить

\setTargetDevice{print} % Целевой девайс [watch|print|phone|debug|microprint]

\toggletrue{paginate} % Начинать каждый билет с новой страницы
%=================================================================
```

В примере выше указаны 8 билетов, они автоматически подтянутся из дирекотрии `src/tickets` по соответствующим именам файлов, а также конфигурация, в которой нужно рендерить проект, в текущей версии поддерживаются Apple Watch, лист формата А4, средний экран телефона и режим отладки с большим полем для аннотаций справа.
