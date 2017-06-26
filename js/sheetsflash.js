function getSearchParams(k){
    var p={};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s,k,v){p[k]=v});
    return k?p[k]:p;
}

function checkDataValidity(data) {
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

function partTsvIntoData(tsv) {
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

function partCsvIntoData(tsv) {
    var lines = tsv.split("\n");
    var n = lines.length;

    var i;
    var data = [];
    for (i=1;i<n;i++) {
        var fields = lines[i].trim().split(",");
        data.push({
            "word": fields[0].substr(1,fields[0].length-2),
            "reading": fields[1].substr(1,fields[1].length-2),
            "meaning": fields[2].substr(1,fields[2].length-2)
        })
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
}
MeaningQuestion.prototype.displayAnswer = function () {
    var meaningCell = $("#meaningCell");
    meaningCell.html(this.item.meaning);
};

