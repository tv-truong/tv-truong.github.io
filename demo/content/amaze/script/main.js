var tl = require("@akashic-extension/akashic-timeline");
var al = require("@akashic-extension/akashic-label");
var t;

var scene;

var player;
var playerIndex;
var playerMoving;

var cells;
var countCell;

var surface1;

var group;
var result;

var level;
var ended;
var paused;

var assetIds = {
    img_player: "img_player",
    img_cell0: "img_cell0",
    img_cell1: "img_cell1",
    json_level: ""
}

const cellWidth = 50;
const cellHeight = 50;

const debug = true;

function main(param) {
    level = param.level;
    if (!level) level = 0;
    if (level < 0) level = 49;
    if (level > 49) level = 0;
    assetIds.json_level = "json_level" + level;

    scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: Object.values(assetIds)
    });
    scene.loaded.add(function () {

        t = new tl.Timeline(scene);

        start(scene);
        
    });
    g.game.pushScene(scene);
}

function start(scene) {
    // background
    var background = new g.FilledRect({
        scene: scene,
        cssColor: "white",
        width: g.game.width,
        height: g.game.height
    });
    scene.append(background);

    // load map data
    var data = JSON.parse(scene.assets[assetIds.json_level].data);
    //console.log(data);

    var startIndex = data.start;
    var map = data.map;

    // fix map: add border to map
    for (var i = 0; i < map.length; i++) {
        map[i].unshift(0);
        map[i].push(0);
    }
    var arr = [];
    for (var j = 0; j < map[0].length; j++) {
        arr.push(0);
    }
    map.unshift(arr);
    map.push(arr);
    startIndex[0] += 1;
    startIndex[1] += 1;

    // render map
    var mapWidth = map[0].length * cellWidth;
    var mapHeight = map.length * cellHeight;
    var scaleX = Math.min(g.game.width / mapWidth, 1);
    var scaleY = Math.min(g.game.height / mapHeight, 1);
    var sacle = Math.min(scaleX, scaleY);

    group = new g.E({ 
        scene: scene,
        width: mapWidth,
        height: mapHeight,
        anchorX: .5,
        anchorY: .5,
        scaleX: sacle,
        scaleY: sacle,
        x: g.game.width * .5,
        y: g.game.height * .5
    });
    scene.append(group);

    var cellImg = scene.assets[assetIds.img_cell0];
    var cellImg1 = scene.assets[assetIds.img_cell1];
    surface1 = new g.Surface(cellImg1.width, cellImg1.height, cellImg1.data);
    // console.log(cellImg1);
    // console.log(surface1);

    cells = [];
    countCell = 0;

    for(var i = 0; i < map.length; i++) {
        var row = [];

        for(var j = 0; j < map[i].length; j++) {
            var value = map[i][j];
            var x = j * cellWidth;
            var y = i * cellHeight;

            if (value == 1) {
                var cell = new g.Sprite({
                    scene: scene,
                    src: cellImg,
                    srcWidth: cellImg.width,
                    srcHeight: cellImg.height,
                    width: cellWidth,
                    height: cellHeight,
                    parent: group,
                    x: x,
                    y: y
                });
                row.push(cell);
                countCell++;
            }
            else {
                var wall = new g.FilledRect({
                    scene: scene,
                    cssColor: "white",
                    width: cellWidth,
                    height: cellHeight,
                    parent: group,
                    x: x,
                    y: y
                });
                row.push(wall);
            }
        }

        cells.push(row);
    }
    //console.log(cells);
    //console.log(scene.children);

    // add player
    playerIndex = startIndex;
    var pos = IndexToPosition(playerIndex);

    var playerImg = scene.assets[assetIds.img_player];

    player = new g.Sprite({
        scene: scene,
        src: playerImg,
        srcWidth: playerImg.width,
        srcHeight: playerImg.height,
        width: cellWidth * group.scaleX,
        height: cellHeight * group.scaleY,
        parent: scene,
        x: pos.x,
        y: pos.y,
        scaleX: .7,
        scaleY: .7,
        angle: 0
    });
    console.log(player);

    // result
    result = new g.FilledRect({
        scene: scene,
        cssColor: "black",
        width: g.game.width,
        height: g.game.height,
        opacity: .5,
        touchable: true
    });

    var dhint = {
        initialAtlasWidth: 256,
        initialAtlasHeight: 256,
        maxAtlasWidth: 256,
        maxAtlasHeight: 256,
        maxAtlasNum: 8
    };

    var dfont = new g.DynamicFont({
        game: scene.game,
        fontFamily: g.FontFamily.Monospace,
        size: 40,
        //hint: dhint
    });

    var label = new al.Label({
        scene: scene,
        width: g.game.width,
        font: dfont,
        fontSize: 40,
        text: "TAP TO CONTINUE",
        textAlign: 1,
        textColor: "white",
        y: g.game.height * .5,
        parent: result
    });

    result.pointUp.add(function(event) {
        NextLevel();
    });

    // debug
    if (debug) AddDebug();
 
    // game logic
    ChangeCell(cells[playerIndex[0]][playerIndex[1]], 0);

    ended = paused = false;
    playerMoving = false;

    scene.pointMoveCapture.add(function(event) {
        //console.log(event);
        //console.log(event.prevDelta);
        if (!event.prevDelta) return;
        var deltaX = event.prevDelta.x;
        var deltaY = event.prevDelta.y;

        if(playerMoving || ended || paused) return;

        var dt = 100;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                for(var i = playerIndex[1] + 1; i < map[0].length; i++) {
                    var value = map[playerIndex[0]][i];
                    if (value == 1) continue;
                    if (i > playerIndex[1] + 1) {
                        for(var j = playerIndex[1] + 1; j < i; j++) {
                            var cell = cells[playerIndex[0]][j];
                            ChangeCell(cell, (j - playerIndex[1] - .5) * dt)
                        }

                        playerIndex[1] = i - 1;

                        PlayerMove();
                    }
                    break;
                }
            }
            else {
                for(var i = playerIndex[1] - 1; i >= 0; i--) {
                    var value = map[playerIndex[0]][i];
                    if (value == 1) continue;
                    if (i < playerIndex[1] - 1) {
                        for(var j = playerIndex[1] - 1; j > i; j--) {
                            var cell = cells[playerIndex[0]][j];
                            ChangeCell(cell, (playerIndex[1] - j - .5) * dt)
                        }

                        playerIndex[1] = i + 1;

                        PlayerMove();
                    }
                    break;
                }
            }
        }
        else {
            if (deltaY > 0) {
                for(var i = playerIndex[0] + 1; i < map.length; i++) {
                    var value = map[i][playerIndex[1]];
                    if (value == 1) continue;
                    if (i > playerIndex[0] + 1) {
                        for(var j = playerIndex[0] + 1; j < i; j++) {
                            var cell = cells[j][playerIndex[1]];
                            ChangeCell(cell, (j - playerIndex[0] - .5) * dt)
                        }

                        playerIndex[0] = i - 1;

                        PlayerMove();
                    }
                    break;
                }
            }
            else {
                for(var i = playerIndex[0] - 1; i >= 0; i--) {
                    var value = map[i][playerIndex[1]];
                    if (value == 1) continue;
                    if (i < playerIndex[0] - 1) {
                        for(var j = playerIndex[0] - 1; j > i; j--) {
                            var cell = cells[j][playerIndex[1]];
                            ChangeCell(cell, (playerIndex[0] - j - .5) * dt)
                        }

                        playerIndex[0] = i + 1;

                        PlayerMove();
                    }
                    break;
                }
            }
        }
    });
}

function Restart() {
    main();
}

function NextLevel() {
    main({level: level + 1});
}

function PreviousLevel() {
    main({level: level - 1});
}

function ShowResult() {
    scene.append(result);
}

function AddDebug() {
    var dhint = {
        initialAtlasWidth: 256,
        initialAtlasHeight: 256,
        maxAtlasWidth: 256,
        maxAtlasHeight: 256,
        maxAtlasNum: 8
    };

    var dfont = new g.DynamicFont({
        game: scene.game,
        fontFamily: g.FontFamily.Monospace,
        size: 40,
        //hint: dhint
    });

    var debugPanel = new g.E({
        scene: scene,
        width: g.game.width,
        height: g.game.height
    });

    debugPanel.background = new g.FilledRect({
        scene: scene,
        cssColor: "black",
        width: debugPanel.width,
        height: debugPanel.height,
        opacity: .5,
        touchable: true,
        parent: debugPanel
    });

    var btnNextStage = new g.FilledRect({
        scene: scene,
        cssColor: "white",
        width: 200,
        height: 50,
        x: (debugPanel.width - 200) / 2,
        y: 150,
        touchable: true,
        parent: debugPanel
    });

    btnNextStage.label = new al.Label({
        scene: scene,
        width: btnNextStage.width,
        font: dfont,
        fontSize: 30,
        text: "Next Stage",
        textAlign: 1,
        textColor: "black",
        y: 0,
        parent: btnNextStage
    });

    var btnPreviousStage = new g.FilledRect({
        scene: scene,
        cssColor: "white",
        width: 200,
        height: 50,
        x: (debugPanel.width - 200) / 2,
        y: 250,
        touchable: true,
        parent: debugPanel
    });

    btnPreviousStage.label = new al.Label({
        scene: scene,
        width: btnPreviousStage.width,
        font: dfont,
        fontSize: 25,
        text: "Previous Stage",
        textAlign: 1,
        textColor: "black",
        y: 0,
        parent: btnPreviousStage
    });

    var btnDebug = new g.FilledRect({
        scene: scene,
        cssColor: "grey",
        width: 80,
        height: 30,
        x: g.game.width - 80,
        y: 0,
        touchable: true,
        parent: scene
    });

    btnDebug.label = new al.Label({
        scene: scene,
        width: btnDebug.width,
        font: dfont,
        fontSize: 20,
        text: "DEBUG",
        textAlign: 1,
        textColor: "white",
        y: 0,
        parent: btnDebug
    });

    btnDebug.pointDown.add(function(event) {
        paused = true;
    });

    btnDebug.pointUp.add(function(event) {
        scene.append(debugPanel);
    });

    debugPanel.background.pointUp.add(function(event) {
        debugPanel.remove();
        paused = false;
    });

    btnNextStage.pointUp.add(function(event) {
        NextLevel();
    });

    btnPreviousStage.pointUp.add(function(event) {
        PreviousLevel();
    });

}

function ChangeCell(cell, delay) {
    if (!!cell.changed) return;
    cell.changed = true;

    countCell--;
    if (countCell == 0) {
        console.log("Win");
        ended = true;
        scene.setTimeout(ShowResult, 1000);
    }

    //console.log(cell);
    scene.setTimeout(() => {
        cell.surface = surface1;
        cell.invalidate();
    }, delay);

    // t.create(cell, { loop: false, modified: cell.modified, destroyed: cell.destroyed})
    // .wait(delay)
    // .call(() => {
    //     cell.surface = surface1;
    //     //cell.invalidate();
    // });
}

function PlayerMove() {
    //console.log(playerIndex);
    playerMoving = true;

    var complete = () => {
        //console.log("complete");
        playerMoving = false;
    }

    var pos = IndexToPosition(playerIndex);
    //console.log({x: pos.x - player.x, y: pos.y - player.y});

    if (pos.x > player.x) {
        if (player.angle != 0) player.angle = 0;
        if (player.scaleX < 0) player.scaleX = -player.scaleX;
        player.modified();
    }
    else if (pos.x < player.x) {
        if (player.angle != 0) player.angle = 0;
        if (player.scaleX > 0) player.scaleX = -player.scaleX;
        player.modified();
    }
    else if (pos.y > player.y) {
        if (player.scaleX < 0) player.scaleX = -player.scaleX;
        if (player.angle < 90) player.angle = 90;
        player.modified();
    }
    else if (pos.y < player.y) {
        if (player.scaleX < 0) player.scaleX = -player.scaleX;
        if (player.angle > -90) player.angle = -90;
        player.modified();
    }

    var d = (Math.abs(pos.x - player.x) / (cellWidth * group.scaleX) + Math.abs(pos.y - player.y) / (cellHeight * group.scaleY)) * 100;

    t.create(player, { loop: false, modified: player.modified, destroyed: player.destroyed})
    .to({ x: pos.x, y: pos.y }, d, tl.Easing.linear)
    .call(complete);
}

function IndexToPosition(index) {
    return {
        x: index[1] * cellWidth * group.scaleX + group.x - group.width * group.scaleX * group.anchorX,
        y: index[0] * cellHeight * group.scaleY + group.y - group.height * group.scaleY * group.anchorY
    }
}

module.exports = main;
