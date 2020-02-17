var imageTop, imageBottom, imageCream;

const init = function() {
    const input = document.getElementById("input");

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    imageTop = new Image();
    imageTop.addEventListener("load", () => {
        imageCream = new Image();

        imageCream.addEventListener("load", () => {
            imageBottom = new Image();

            imageBottom.addEventListener("load", () => {
                imageNameToAsset = {
                    top: imageTop,
                    bottom: imageBottom,
                    cream: imageCream
                };

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

var imageNameToAsset;

const onInput = (canvas, ctx, imageTop, imageCream, imageBottom) => ({ target })  => {
    const symbolImages = {
        [symbolO]: {
            img: ["top", "bottom"],
            // nonSequentialOffset: 5,
            height: 16
        },
        [symbolRE]: {
            img: ["cream"],
            xOffset: 8,
            nonSequentialOffset: 7,
            height: 7
        }
    };

    const input = target.value;

    const { symbols, counts: requiredCounts } = parseInput(input);

    console.log(symbols);
    draw(canvas, ctx, symbolImages, symbols.reverse(), requiredCounts);
};

const parseInput = input =>
    input.split("")
        .map(char => char.toUpperCase())
        .filter(char =>
            allowedChars.includes(char))
        .reduce((agg, char) => {
            if(char == "O") {
                agg.symbols.push(symbolO);
                agg.counts.cookies += 1;
            }
            else if(char == "R")
                agg.last = "R";
            else if(char == "E") {
                if(agg.last == "R") {
                    agg.symbols.push(symbolRE);
                    agg.counts.cream += 1;
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

const getParams = (symbolImages, symbols) => {
    const { params } = symbols.reverse().reduce((agg, symbol, i) => {
        const { img, height, nonSequentialOffset } = symbolImages[symbol];

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

const draw = (canvas, ctx, symbolImages, symbols, requiredCounts) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const params = getParams(symbolImages, symbols);
    const offsets = calculateOffsets(params);

    const topOffset = offsets[offsets.length - 1];
    const topImage = symbolImages[topOffset[0]];

    const totalHeight = topOffset[1] + (imageNameToAsset[topImage.img[0]].height) + topImage.height;

    // console.log(offsets);

    console.log(requiredCounts);

    const oreosAvailable = countOreos(requiredCounts);
    const cookieAvails = {
        top: oreosAvailable,
        bottom: oreosAvailable,
        cream: oreosAvailable
    };

    console.log(cookieAvails);

    offsets.forEach(([symbol, yOffset]) => {
        const { asset, xOffset } = selectImg(symbol, symbolImages, cookieAvails);

        const yStart = totalHeight - yOffset - asset.height;

        ctx.drawImage(asset, xOffset, yStart);
        // ctx.strokeRect(xOffset, yStart, img.width, img.height);
    });

};

const selectImg = (symbol, symbolImages, avails) => {
    const { img, xOffset = 0 } = symbolImages[symbol];

    const chosenImage = img[symbol == symbolO
            ? (avails["top"] < (avails["bottom"]+1)
            ? 1
            : 0)
        : 0];

    const asset = imageNameToAsset[chosenImage]

    avails[chosenImage] -= 1;

    return { asset, xOffset };
};
