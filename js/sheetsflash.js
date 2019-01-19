function getSearchParams(k){
    var p={};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s,k,v){p[k]=v});
    return k?p[k]:p;
}

function checkWordReadingMeaningDataValidity(data) {
    if (!$.isArray(data)) {
        throw "Data is not an array.";
    } else if (data.length === 0) {
        throw "Data array is empty.";
    } else {
        var i;
        for (i = 0; i < data.length; i++) {
            var item = data[i];
            if (!item.hasOwnProperty("word")) {
                throw "The " + i + "th item does not have the 'word' field.";
            }
            if (!item.hasOwnProperty("reading")) {
                throw "The " + i + "th item does not have the 'reading' field.";
            }
            if (!wanakana.isHiragana(item.reading)) {
                throw "The " + i + "th item's reading is not Hiragana.";
            }
            if (!item.hasOwnProperty("meaning")) {
                throw "The " + i + "th item does not have the 'meaning' field.";
            }
        }
    }
}

function checkWordReadingAccentDataValidity(data) {
    if (!$.isArray(data)) {
        throw "Data is not an array.";
    } else if (data.length === 0) {
        throw "Data array is empty.";
    } else {
        var i;
        for (i = 0; i < data.length; i++) {
            var item = data[i];
            if (!item.hasOwnProperty("word")) {
                throw "The " + i + "th item does not have the 'word' field.";
            }
            if (!item.hasOwnProperty("reading")) {
                throw "The " + i + "th item does not have the 'reading' field.";
            }
            if (!wanakana.isHiragana(item.reading)) {
                throw "The " + i + "th item's reading is not Hiragana.";
            }
            if (!item.hasOwnProperty("accent")) {
                throw "The " + i + "th item does not have the 'accent' field.";
            }
            if (!$.isArray(item.accent)) {
                throw "The " + i + "th item accent field is not an array.";
            }
            if (item.accent.length === 0) {
                throw "The " + i + "th item accent field is empty.";
            }
            var j;
            for (j=0; j < item.accent.length; j++) {
                if (!(item.accent[j] === parseInt(item.accent[j], 10))) {
                    throw "The " + i + "th item's " + j + "th accent data is not an integer.";
                }
            }
        }
    }
}

function checkBushuDataValidity(data) {
    if (!$.isArray(data)) {
        throw "Data is not an array.";
    } else if (data.length === 0) {
        throw "Data array is empty.";
    } else {
        var i;
        for (i = 0; i < data.length; i++) {
            var item = data[i];
            if (!item.hasOwnProperty("kanji")) {
                throw "The " + i + "th item does not have the 'kanji' field.";
            }
            if (!item.hasOwnProperty("bushu")) {
                throw "The " + i + "th item does not have the 'bushu' field.";
            }
            if (!item.hasOwnProperty("name")) {
                throw "The " + i + "th item does not have the 'name' field.";
            }
            var j;
            for (j=0; j < item.name.length; j++) {
                if (!wanakana.isHiragana(item.name[j])) {                    
                    throw "The " + i + "th item's " + j + "th name is not Hiragana.";                    
                }            
            }            
        }
    }
}

function decomposeToWordSequence(s) {
    return s.split(/\s+/);
}

function decomposeMeaningString(meaningString) {
    var meanings = meaningString.split(/[,\;]/);
    meanings = meanings.map(function (x) {
        return decomposeToWordSequence($.trim(x)).map(function (y) {
            return y.toLowerCase();
        });
    });
    return meanings;
}

function decomposeAccentString(accentString) {
    return accentString.split(",").map(x => parseInt(x));
}

function decomposeBushuNameString(accentString) {
    return accentString.split("、");
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function checkAnswerAgainstMeaning(answer, meaningString) {
    var answerSequence = decomposeToWordSequence(answer);
    var meanings = decomposeMeaningString(meaningString);
    var found = false;
    var i;
    for (i = 0; i < meanings.length; i++) {
        var meaning = meanings[i];
        if (arraysEqual(answerSequence, meaning)) {
            found = true;
            break;
        }
    }
    return found;
}

function randInt(n) {
    return Math.floor(Math.random() * n)
}

function chooseRandomItem(data) {
    return data[randInt(data.length)];
}

function parseTsvIntoData(tsv) {
    var lines = tsv.split("\n");
    var n = lines.length;

    var i;
    var data = [];
    for (i=1;i<n;i++) {
        var fields = lines[i].trim().split("\t");
        data.push({
            "word": fields[0],
            "reading": fields[1],
            "meaning": fields[2]
        })
    }

    return data;
}

function parseCsvIntoData(tsv) {
    var lines = tsv.split("\n");
    var n = lines.length;

    var i;
    var data = [];
    for (i = 1; i < n; i++) {
        var fields = lines[i].trim().split(",");
        data.push({
            "word": fields[0].substr(1, fields[0].length - 2),
            "reading": fields[1].substr(1, fields[1].length - 2),
            "meaning": fields[2].substr(1, fields[2].length - 2)
        })
    }

    return data;
}

function parseGoogleSheetsResponseIntoWordReadingMeaningData(response) {
    var rows = response.table.rows;
    var n = rows.length;

    var i;
    var data = [];
    for (i = 1; i < n; i++) {
        var row = rows[i];
        data.push({
            "word": row.c[0].v,
            "reading": row.c[1].v,
            "meaning": row.c[2].v
        })
    }

    return data;
}

function parseGoogleSheetsResponseIntoWordReadingAccentData(response) {
    var rows = response.table.rows;
    var n = rows.length;

    var i;
    var data = [];
    for (i=1; i < n; i++) {
        var row = rows[i];
        data.push({
            "word": row.c[0].v,
            "reading": row.c[1].v,
            "accent": decomposeAccentString(row.c[2].v.toString())
        });
    }

    return data;
}

function parseGoogleSheetsResponseIntoBushuData(response) {
    var rows = response.table.rows;
    var n = rows.length;

    var i;
    var data = [];
    for (i=1; i < n; i++) {
        var row = rows[i];
        data.push({
            "kanji": row.c[0].v,
            "bushu": row.c[1].v,
            "name": decomposeBushuNameString(row.c[2].v)
        });

    }

    return data;
}

function Card(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    this.item = item;
    this.gameDiv = gameDiv;
    this.correctCallBack = correctCallBack;
    this.wrongCallBack = wrongCallBack;
    this.nextCallBack = nextCallBack;
}
Card.prototype = {
    constructor: Card,
    html: function () {
        return "";
    },
    run: function () {
        var thou = this;
        this.gameDiv.html(this.html());

        var showButton = $("#showButton");
        showButton.click(function () {
            thou.showAnswer();
        });
        showButton.focus();

        $(window).off("keypress");
    },
    displayAnswer: function () {
        // NO-OP
    },
    showAnswer: function () {
        var thou = this;

        this.displayAnswer();

        var buttonRow = $("#buttonRow");
        buttonRow.html(
            "<td id='correctCell' width='50%' style='border: none' align='center'>" +
            "<button style='width: 100%' class='btn btn-danger' id='wrongButton'>&#10008; Too bad!</button>" +
            "</td>" +
            "<td id='correctCell' width='50%' style='border: none' align='center'>" +
            "<button style='width: 100%' class='btn btn-success' id='correctButton'>&#10003; Got it!</button>" +
            "</td>"
        );

        var correctButton = $("#correctButton");
        var correctFunc = function () {
            if (thou.correctCallBack !== null) {
                thou.correctCallBack(this);
            }
            thou.nextCallBack(this);
        };
        correctButton.click(correctFunc);

        var wrongButton = $("#wrongButton");
        var wrongFunc = function () {
            if (thou.wrongCallBack !== null) {
                thou.wrongCallBack(this)
            }
            thou.nextCallBack(this);
        };
        wrongButton.click(wrongFunc);

        $(window).keypress(function (event) {
            if (event.key === "Enter" || event.key === "Space" || event.key === "2") {
                correctFunc();
            } else if (event.key === "Escape" || event.key === "Backspace" || event.key === "1") {
                wrongFunc();
            }
        });
    }
};

function ReadingCard(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    Card.call(this, item, gameDiv, correctCallBack, wrongCallBack, nextCallBack);
}
ReadingCard.prototype = Object.create(Card.prototype);
ReadingCard.prototype.constructor = ReadingCard;
ReadingCard.prototype.displayAnswer = function () {
    var readingButton = $("#readingButton");
    readingButton.html(this.item.reading);
};
ReadingCard.prototype.html = function () {
    return "<table class='table'>" +
        "<tr><td colspan='2' id='wordCell' style='border: none'><h1 align='center'>" + this.item.word + "</h1></td></tr>" +
        "<tr><td colspan='2' id='readingCell' style='border: none' align='center'>" +
        "<button style='width: 100%' class='btn btn-default' id='readingButton'>Reading = ???</button>" +
        "</td></tr>" +
        "<tr><td colspan='2' id='meaningCell' style='border: none' align='center'>" + this.item.meaning + "</td></tr>" +
        "<tr id='buttonRow'>" +
        "<td style='border: none' align='center'>" +
        "<button class='btn btn-primary' style='width: 100%' id='showButton'>Show answer...</button>" +
        "</td>" +
        "</tr>" +
        "</table>";
};

function MeaningCard(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    Card.call(this, item, gameDiv, correctCallBack, wrongCallBack, nextCallBack);
}
MeaningCard.prototype = Object.create(Card.prototype);
MeaningCard.prototype.constructor = MeaningCard;
MeaningCard.prototype.displayAnswer = function () {
    var meaningButton = $("#meaningButton");
    meaningButton.html(this.item.meaning);
};
MeaningCard.prototype.html = function () {
    return "<table class='table'>" +
        "<tr><td colspan='2' id='wordCell' style='border: none'><h1 align='center'>" + this.item.word + "</h1></td></tr>" +
        "<tr><td colspan='2' id='meaningCell' style='border: none' align='center'>" +
        "<button style='width: 100%' class='btn btn-default' id='meaningButton'>Meaning = ???</button>" +
        "</td></tr>" +
        "<tr><td colspan='2' id='readingCell' style='border: none' align='center'>" + this.item.reading + "</td></tr>" +
        "<tr id='buttonRow'>" +
        "<td style='border: none' align='center'>" +
        "<button class='btn btn-primary' style='width: 100%' id='showButton'>Show answer...</button>" +
        "</td>" +
        "</tr>" +
        "</table>";
};

function MeaningAndExampleCard(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    Call.call(this, item, gameDiv, correctCallBack, wrongCallBack, nextCallBack);
}
MeaningAndExampleCard.prototype = Object.create(Card.prototype);
MeaningAndExampleCard.prototype.constructor = MeaningAndExampleCard;
MeaningAndExampleCard.prototype.displayAnswer = function() {
    var meaningButton = $("#meaningButton");
    meaningButton.html(this.item.meaning);
    var exampleButton = $("#exampleButton");
    exampleButton.html(this.item.example); 
}
MeaningAndExampleCard.prototype.html = function() {
    return "<table class='table'>" +
        "<tr><td colspan='2' id='wordCell' style='border: none'><h1 align='center'>" + this.item.word + "</h1></td></tr>" +
        "<tr><td colspan='2' id='meaningCell' style='border: none' align='center'>" +
        "<button style='width: 100%' class='btn btn-default' id='meaningButton'>Meaning = ???</button>" +
        "</td></tr>" +
        "<tr><td colspan='2' id='exampleCell' style='border: none' align='center'>" +
        "<button style='width: 100%' class='btn btn-default' id='exampleButton'>Example = ???</button>" +
        "</td></tr>" +
        "<tr id='buttonRow'>" +
        "<td style='border: none' align='center'>" +
        "<button class='btn btn-primary' style='width: 100%' id='showButton'>Show answer...</button>" +
        "</td>" +
        "</tr>" +
        "</table>"
}

function Question(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    this.item = item;
    this.gameDiv = gameDiv;
    this.correctCallBack = correctCallBack;
    this.wrongCallBack = wrongCallBack;
    this.nextCallBack = nextCallBack;
}
Question.prototype = {
    constructor: Question,
    html: function () {
        return "";
    },
    run: function () {
        var thou = this;
        this.gameDiv.html(this.html());

        var userText = $("#userText");
        userText.keyup(function (event) {
            if (event.key === "Enter" && event.target === this) {
                if ($("#userText").val() !== "") {
                    thou.check();
                }
            }
        });
        userText.focus();

        $("#checkButton").click(function () {
            thou.check();
        });
    },
    checkAnswer: function(answer) {
        return false;
    },
    displayAnswer: function () {
        // NO-OP
    },
    check: function() {
        var userText = $("#userText");
        var answer = userText.val();
        var correct = this.checkAnswer(answer);

        this.displayAnswer();

        var wordCell = $("#wordCell");
        var readingCell = $("#readingCell");
        var meaningCell = $("#meaningCell");
        var buttonCell = $("#buttonCell");

        if (correct) {
            this.correctCallBack(this);
            wordCell.addClass("success");
            readingCell.addClass("success");
            meaningCell.addClass("success");
            buttonCell.addClass("success");
        } else {
            this.wrongCallBack(this);
            wordCell.addClass("danger");
            readingCell.addClass("danger");
            meaningCell.addClass("danger");
            buttonCell.addClass("danger");
        }

        buttonCell.html("<button style='width: 100%' id='nextButton' class='btn'>Next!</button>");

        var nextButton = $("#nextButton");
        var thou = this;
        nextButton.click(function () {
            thou.nextCallBack(this);
        });
        nextButton.focus();
    }
};

function ReadingQuestion(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    Question.call(this, item, gameDiv, correctCallBack, wrongCallBack, nextCallBack);
}
ReadingQuestion.prototype = Object.create(Question.prototype);
ReadingQuestion.prototype.constructor = ReadingQuestion;
ReadingQuestion.prototype.html = function () {
    return "<table class='table'>" +
        "<tr><td colspan='2' id='wordCell' style='border: none'><h1 align='center'>" + this.item.word + "</h1></td></tr>" +
        "<tr><td colspan='2' id='readingCell' style='border: none' align='center'>" +
        "<input type='text' id='userText' style='width: 100%; text-align: center'>" +
        "</td></tr>" +
        "<tr><td colspan='2' id='meaningCell' style='border: none' align='center'>" + this.item.meaning + "</td></tr>" +
        "<tr id='buttonRow'>" +
        "<td style='border: none' align='center' id='buttonCell'>" +
        "<button class='btn' style='width: 100%' id='checkButton'>Check!</button>" +
        "</td>" +
        "</tr>" +
        "</table>";
};
ReadingQuestion.prototype.displayAnswer = function () {
    var readingCell = $("#readingCell");
    readingCell.html(this.item.reading);
};
ReadingQuestion.prototype.checkAnswer = function(answer) {
    answer = wanakana.toKana($.trim(answer));
    return answer === this.item.reading;
};

function MeaningQuestion(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    Question.call(this, item, gameDiv, correctCallBack, wrongCallBack, nextCallBack);
}
MeaningQuestion.prototype = Object.create(Question.prototype);
MeaningQuestion.prototype.constructor = MeaningQuestion;
MeaningQuestion.prototype.html = function () {
    return "<table class='table'>" +
        "<tr><td colspan='2' id='wordCell' style='border: none'><h1 align='center'>" + this.item.word + "</h1></td></tr>" +
        "<tr><td colspan='2' id='readingCell' style='border: none' align='center'>" + this.item.reading + "</td></tr>" +
        "<tr><td colspan='2' id='meaningCell' style='border: none' align='center'>" +
        "<input type='text' id='userText' style='width: 100%; text-align: center'>" +
        "</td></tr>" +
        "<tr id='buttonRow'>" +
        "<td style='border: none' align='center' id='buttonCell'>" +
        "<button class='btn' style='width: 100%' id='checkButton'>Check!</button>" +
        "</td>" +
        "</tr>" +
        "</table>";
};
MeaningQuestion.prototype.checkAnswer = function(answer) {
    answer = $.trim(answer);
    return checkAnswerAgainstMeaning(answer, this.item.meaning);
};
MeaningQuestion.prototype.displayAnswer = function () {
    var meaningCell = $("#meaningCell");
    meaningCell.html(this.item.meaning);
};

class AccentQuestion {
    constructor(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
        this.item = item;
        this.gameDiv = gameDiv;
        this.correctCallBack = correctCallBack;
        this.wrongCallBack = wrongCallBack;
        this.nextCallBack = nextCallBack;        
    }

    get html() {
        return "<table class='table'>" +
        "<tr><td colspan='2' id='wordCell' style='border: none'><h1 align='center'>" + this.item.word + "</h1></td></tr>" +
        "<tr><td colspan='2' id='readingCell' style='border: none' align='center'>" + this.item.reading + "</td></tr>" +
        "<tr><td colspan='2' id='accentCell' style='border: none' align='center'></td></tr>" +
        "<tr><td colspan='2' id='buttonCell' style='border: none' align='center'></td></tr>" +
        "</table>";
    }

    asssignAccentButtonCallback(index) {
        var thou = this;
        var accentButton = $("#accentButton" + index);        
        accentButton.click(function() {                
            thou.check(index);
        });            
    }

    run() {
        var thou = this;
        this.gameDiv.html(this.html);
        var accentCell = $("#accentCell");

        var accentCellHtml = "";
        var i;
        var n = this.item.reading.length;
        for(i=0;i<n;i++) {
            accentCellHtml += "<button type='button' id='accentButton" + (i+1) + "'>" + 
                this.item.reading[i] + "＼</button> ";
        }
        accentCellHtml += "<button type='button' id='accentButton0'>平板</button>"
        accentCell.html(accentCellHtml);
        
        for(i=0;i<=n;i++) {
            this.asssignAccentButtonCallback(i);
        }

        $(window).keypress(function (event) {
            if (!isNaN(parseInt(event.key))) {
                thou.check(parseInt(event.key));
            }
        });
    }

    check(answer) {
        var correct = $.inArray(answer, this.item.accent) != -1;
        this.displayAnswer();

        var wordCell = $("#wordCell");
        var readingCell = $("#readingCell");
        var meaningCell = $("#accentCell");        
        var buttonCell = $("#buttonCell");

        if (correct) {            
            this.correctCallBack(this);
            wordCell.addClass("success");
            readingCell.addClass("success");
            meaningCell.addClass("success");
            buttonCell.addClass("success");
        } else {
            this.wrongCallBack(this);
            wordCell.addClass("danger");
            readingCell.addClass("danger");
            meaningCell.addClass("danger");
            buttonCell.addClass("danger");
        }

        buttonCell.html("<button style='width: 100%' id='nextButton' class='btn'>Next!</button>");

        var nextButton = $("#nextButton");
        var thou = this;
        nextButton.click(function () {
            thou.nextCallBack(this);
        });
        nextButton.focus();
        $(window).off("keypress");
    }

    accentText(position) {
        var reading = this.item.reading;
        if (position === 0) {
            return this.item.reading + "￣（平板）<br/>"　
        } else {
            var result = "";
            var n = this.item.reading.length;
            var i;
            for(i=0;i<n;i++) {
                result += this.item.reading[i];
                if (i==position-1) {
                    result += "＼";
                }
            }
            return result + "<br/>";
        }
    }

    displayAnswer() {
        var accentCell = $("#accentCell");
        var accentCellHtml = "";
        var thou = this;
        this.item.accent.map(function(i) {
            accentCellHtml += thou.accentText(i);
        });
        accentCell.html("<b>" + accentCellHtml + "</b>");
    }
}

function BushuQuestion(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    Question.call(this, item, gameDiv, correctCallBack, wrongCallBack, nextCallBack);
}
BushuQuestion.prototype = Object.create(Question.prototype);
BushuQuestion.prototype.constructor = BushuQuestion;
BushuQuestion.prototype.html = function () {
    return "<table class='table'>" +
        "<tr><td colspan='2' id='kanjiCell' style='border: none'><h1 align='center'>" + this.item.kanji + "</h1></td></tr>" +        
        "<tr><td colspan='2' id='bushuCell' style='border: none'><h2 align='center'>部首＝？</h2></td></tr>" +
        "<tr><td colspan='2' id='nameCell' style='border: none' align='center'>" +
        "<input type='text' id='userText' style='width: 100%; text-align: center'>" +
        "</td></tr>" +
        "<tr id='buttonRow'>" +
        "<td style='border: none' align='center' id='buttonCell'>" +
        "<button class='btn' style='width: 100%' id='checkButton'>Check!</button>" +
        "</td>" +
        "</tr>" +
        "</table>";
};
BushuQuestion.prototype.displayAnswer = function () {
    var bushuCell = $("#bushuCell");
    bushuCell.html("<h1 align='center'>" + this.item.bushu + "</h1>");
    var nameCell = $("#nameCell");
    nameCell.html(this.item.name.join("、"));
};
BushuQuestion.prototype.checkAnswer = function(answer) {
    answer = wanakana.toKana($.trim(answer));
    return this.item.name.includes(answer)
};
BushuQuestion.prototype.check = function() {
    var nameText = $("#userText");
    var answer = nameText.val();
    var correct = this.checkAnswer(answer);    

    this.displayAnswer();

    var kanjiCell = $("#kanjiCell");
    var bushuCell = $("#bushuCell");
    var nameCell = $("#nameCell");
    var buttonCell = $("#buttonCell");

    if (correct) {
        this.correctCallBack(this);
        kanjiCell.addClass("success");
        bushuCell.addClass("success");
        nameCell.addClass("success");
        buttonCell.addClass("success");
    } else {
        this.wrongCallBack(this);
        kanjiCell.addClass("danger");
        bushuCell.addClass("danger");
        nameCell.addClass("danger");
        buttonCell.addClass("danger");
    }

    buttonCell.html("<button style='width: 100%' id='nextButton' class='btn'>Next!</button>");

    var nextButton = $("#nextButton");
    var thou = this;
    nextButton.click(function () {
        thou.nextCallBack(this);
    });        
    nextButton.focus();
}

function BushuCard(item, gameDiv, correctCallBack, wrongCallBack, nextCallBack) {
    Card.call(this, item, gameDiv, correctCallBack, wrongCallBack, nextCallBack);
}
BushuCard.prototype = Object.create(Card.prototype);
BushuCard.prototype.constructor = BushuCard;
BushuCard.prototype.displayAnswer = function () {
    var bushuCell = $("#bushuCell");
    bushuCell.html("<h1 align='center'>" + this.item.bushu + "</h1>");
    var nameCell = $("#nameCell");
    nameCell.html(this.item.name.join("、"));
};
BushuCard.prototype.html = function () {
    return "<table class='table'>" +
        "<tr><td colspan='2' id='kanjiCell' style='border: none'><h1 align='center'>" + this.item.kanji + "</h1></td></tr>" +        
        "<tr><td colspan='2' id='bushuCell' style='border: none'><h2 align='center'>部首＝？</h2></td></tr>" +
        "<tr><td colspan='2' id='nameCell' style='border: none' align='center'>部首名＝？</td></tr>" +
        "<tr id='buttonRow'>" +
        "<td style='border: none' align='center'>" +
        "<button class='btn btn-primary' style='width: 100%' id='showButton'>Show answer...</button>" +
        "</td>" +
        "</tr>" +
        "</table>";
};
BushuCard.prototype.showAnswer　= function () {
    var thou = this;

    this.displayAnswer();

    var buttonRow = $("#buttonRow");
    buttonRow.html(
        "<td id='correctCell' width='50%' style='border: none' align='center'>" +
        "<button style='width: 100%' class='btn btn-danger' id='wrongButton'>&#10008; Too bad!</button>" +
        "</td>" +
        "<td id='correctCell' width='50%' style='border: none' align='center'>" +
        "<button style='width: 100%' class='btn btn-success' id='correctButton'>&#10003; Got it!</button>" +
        "</td>"
    );

    var correctButton = $("#correctButton");
    var correctFunc = function () {
        if (thou.correctCallBack !== null) {
            thou.correctCallBack(this);
        }
        thou.nextCallBack(this);
    };
    correctButton.click(correctFunc);

    var wrongButton = $("#wrongButton");
    var wrongFunc = function () {
        if (thou.wrongCallBack !== null) {
            thou.wrongCallBack(this)
        }
        thou.nextCallBack(this);
    };
    wrongButton.click(wrongFunc);

    $(window).keypress(function (event) {
        if (event.key === "Enter" || event.key === "Space" || event.key === "2") {
            correctFunc();
        } else if (event.key === "Escape" || event.key === "Backspace" || event.key === "1") {
            wrongFunc();
        }
    });
}