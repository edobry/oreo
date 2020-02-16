const init = function() {
    const input = document.getElementById("input");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const imageTop = new Image();
    imageTop.addEventListener("load", () => {
        const imageCream = new Image();

        imageCream.addEventListener("load", () => {
            const imageBottom = new Image();

            imageBottom.addEventListener("load", () => {
                input.addEventListener("input", onInput(canvas, ctx, imageTop, imageCream, imageBottom));
            });
            imageBottom.src = "bottom.png";

        });
        imageCream.src = "cream.png";

    });
    imageTop.src = "top.png";

    console.log("blep");
};

const symbolO = "O";
const symbolRE = "RE";
const allowedChars = [...symbolO, ...symbolRE];

const onInput = (canvas, ctx, imageTop, imageCream, imageBottom) => ({ target })  => {
    const images = {
        [symbolO]: {
            img: imageTop,
            // nonSequentialOffset: 5,
            height: 16
        },
        [symbolRE]: {
            img: imageCream,
            xOffset: 8,
            nonSequentialOffset: 7,
            height: 7
        }
    };

    const string = target.value;

    const { symbols, counts } = string.split("")
        .map(char => char.toUpperCase())
        .filter(char =>
            allowedChars.includes(char))
        .reduce((agg, char) => {
            if(char == "O") {
                agg.symbols.push(symbolO);
                agg.count.cookies += 1;
            }
            else if(char == "R")
                agg.last = "R";
            else if(char == "E") {
                if(agg.last == "R") {
                    agg.symbols.push(symbolRE);
                    agg.count.cream += 1;
                }
            }

            agg.last = char;
            return agg;
        }, {
            symbols: [],
            counts: {
                cookies: 0,
                cream: 0
            },
            last: ""
        });

    console.log(symbols);
    draw(canvas, ctx, images, symbols, counts);
};

const getParams = (images, symbols) => {
    const { params } = symbols.reverse().reduce((agg, symbol, i) => {
        const { img, height, nonSequentialOffset } = images[symbol];

        // ((symbols.length - (i + 1)) * 7) + y)

        const offset = agg.last && agg.last.symbol != symbol && nonSequentialOffset
            ? nonSequentialOffset
            : 0;

        const param = {
            symbol,
            offset,
            height
        };

        agg.params.push(param)
        agg.last = param;

        return agg;
    }, {
        params: []
    });

    return params;
};

const calculateOffsets = params => {
    const { offsets } = params.reduce((agg, { symbol, offset, height }) => {
        const currentOffset = agg.last + offset;
        agg.offsets.push([symbol, currentOffset, { offset, height }]);

        //the next symbol should start above the current
        agg.last = currentOffset + height;
        return agg;
    }, {
        offsets: [],
        last: 0
    });

    return offsets;
};

const countOreos = ({ cookies, cream }) => {
    //since we only get 1 cream per oreo, we need
    //at least as many oreos as we need cream
    let oreosRequired = cream;

    //we get 2 cookies per oreo, so we have that many available
    const availableCookies = oreosRequired * 2;
    if(cookies > availableCookies) {
        const cookieDeficit = cookies - availableCookies;
        oreosRequired += Math.ceil(cookieDeficit / 2);
    }

    return oreosRequired;
};

const draw = (canvas, ctx, images, symbols, counts) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const params = getParams(images, symbols);
    const offsets = calculateOffsets(params);

    const topOffset = offsets[offsets.length - 1];
    const topImage = images[topOffset[0]];

    const totalHeight = topOffset[1] + (topImage.img.height) + topImage.height;

    console.log(offsets);

    const oreosAvailable = countOreos(counts);
    const cookieAvails = {
        top: oreosAvailable,
        bottom: oreosAvailable
    };

    offsets.forEach(([symbol, yOffset]) => {
        const { img, xOffset = 0 } = images[symbol];

        const yStart = totalHeight - yOffset - img.height;

        ctx.drawImage(img, xOffset, yStart);
        // ctx.strokeRect(xOffset, yStart, img.width, img.height);
    });

}
