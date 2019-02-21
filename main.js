const draw = function() {
    const input = document.getElementById("input");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const imageO = new Image();
    imageO.addEventListener("load", () => {
        const imageRE = new Image();

        imageRE.addEventListener("load", () => {
            input.addEventListener("input", onInput(canvas, ctx, imageO, imageRE));
        });
        imageRE.src = "RE.png";

    });
    imageO.src = "O.png";

    console.log("blep");
};

const symbolO = "O";
const symbolRE = "RE";

const onInput = (canvas, ctx, imageO, imageRE) => ({ target })  => {
    const images = {
        [symbolO]: {
            img: imageO,
            offset: {
                y: 5
            }
        },
        [symbolRE]: {
            img: imageRE,
            offset: {
                x: 8,
                y: 7
            }
        }
    };

    const string = target.value;

    const { parsed } = string.split("")
        .map(char => char.toUpperCase())
        .filter(char =>
            ["O", "R", "E"].includes(char))
        .reduce((agg, char) => {
            if(char == "O")
                agg.parsed.push(symbolO);
            else if(char == "R")
                agg.last = "R";
            else if(char == "E") {
                if(agg.last == "R")
                    agg.parsed.push(symbolRE);
            }

            agg.last = char;
            return agg;
        }, {
            parsed: [],
            last: ""
        });

    console.log(parsed);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parsed.reverse().forEach((symbol, i) => {
        const { img, offset: { x = 0, y } } = images[symbol];

        ctx.drawImage(img, x, ((parsed.length - (i + 1)) * 7) + y);
    });
};
