Vue.component('vuetris', {
    template: '#vuetris-template'
});

var Vuetris = new Vue({
    el: '#vuetris',
    data: {
        Block:        [],
        Blocks:       [],
        Board:        [],
        BlockClass:   "vuetris-block",
        Interval:     false,
        Score:        0,
        ScoreText:    "SCORE: ",
        ScoreClass:   "",
        Text:         [{text: "SCORE: 0",className:this.ScoreClass}],
        PointVal:     10,
        MinY:         1,
        MaxX:         9,
        MaxY:         15,
        BlockSize:    25,
        DropPace:     250
    },
    methods: {
        /* creates array grid for board */
        createBoard: function(newShape) {
            var board = [];
            for(i = 0; i <= this.MaxX;) {
                var rows    = [];
                for(i2 = 0; i2 <= this.MaxY;) {
                    rows.push(0);
                    i2++;
                }
                board.push(rows);
                i++;
            }
            this.Board = board;
            $.each(this.Blocks, function(index, value) {
                var xPos        = value.x/Vuetris.BlockSize;
                var yPos        = value.y/Vuetris.BlockSize;
                Vuetris.Board   = Vuetris.fillPosition(xPos,yPos,false);
                Vuetris.completeLine(yPos);
            });
            if(newShape) {
                this.createShape(this.newX(),this.MinY, false);
            }
        },
        /* begins the game */
        start: function() {
            if(this.Interval) {
                clearInterval(Vuetris.Interval);
                clearInterval(this.Interval);
                this.Interval = false;
            }
            this.reset();
            this.createBoard(true);
        },
        /* un/pauses game */
        pause: function() {
            if(this.Interval) {
                clearInterval(Vuetris.Interval);
                clearInterval(this.Interval);
                this.Interval = false;
            } else {
                this.Interval = setInterval(function() { Vuetris.dropBlocks() },this.DropPace);
            }
        },
        /* validates shape drop */
        dropBlocks: function() {
            if(this.Block.length > 0) {
                var dropSave    = 0;
                var i           = 0;
                var x           = false;
                var y           = false;
                var canDrop     = true;
                $.each(this.Block, function(index, value) {
                    if(i == 0) {
                        x = value.x / Vuetris.BlockSize;
                        y = value.y / Vuetris.BlockSize;
                    }
                    var gridX       = value.x/Vuetris.BlockSize;
                    var gridY       = (value.y/Vuetris.BlockSize)+1;
                    var isFilled    = Vuetris.isPositionFilled(gridX,gridY);
                    var canThisMove = Vuetris.canMove(value.x, value.y+Vuetris.BlockSize);
                    if(
                        canDrop == false
                        || isFilled
                        || !canThisMove
                    ) {
                        if(canDrop == true) {
                            Vuetris.Blocks  = Vuetris.Blocks.concat(Vuetris.Block);
                            Vuetris.Block   = [];
                            dropSave        = i;
                            canDrop         = false;
                        }
                    } else {
                        x = value.x / Vuetris.BlockSize;
                        y = value.y / Vuetris.BlockSize;
                    }
                    i++;
                });
                if(canDrop == true) {
                    this.shapeDown();
                } else {
                    if(y < this.MinY+1) {
                        this.pause();
                    } else {
                        this.createBoard(true);
                    }
                }
            }
        },
        /* drops a shape */
        shapeDown: function() {
            $.each(this.Block, function(index, value) {
                value.y += Vuetris.BlockSize;
            });
        },
        /* shifts shape left */
        shapeLeft: function() {
            var canMove = true;
            $.each(this.Block, function(index, value) {
                var newX        = value.x - Vuetris.BlockSize;
                var canThisMove = Vuetris.canMove(newX, value.y);
                var isFilled    = Vuetris.isPositionFilled(newX/Vuetris.BlockSize,(value.y/Vuetris.BlockSize));
                if(canThisMove == false || isFilled == true) {
                    canMove = false;
                }
            });
            if(canMove) {
                $.each(this.Block, function(index, value) {
                    value.x -= Vuetris.BlockSize;
                });
            }
        },
        /* shifts shape right */
        shapeRight: function() {
            var canMove = true;
            $.each(this.Block, function(index, value) {
                var newX        = value.x + Vuetris.BlockSize;
                var canThisMove = Vuetris.canMove(newX, value.y);
                var isFilled    = Vuetris.isPositionFilled(newX/Vuetris.BlockSize,(value.y/Vuetris.BlockSize));
                if(canThisMove == false || isFilled == true) {
                    canMove = false;
                }
            });
            if(canMove) {
                $.each(this.Block, function(index, value) {
                    value.x += Vuetris.BlockSize;
                });
            }
        },
        /* rotates shapes */
        shapeRotate: function() {
            var canMove         = true;
            var origBlock       = false;
            var i               = 0;
            $.each(this.Block, function(index, value) {
                if(i == 0) {
                    origBlock = value;
                }
                i++;
            });
            var rotateCoords = this.rotateShape(
                origBlock.blockType,
                origBlock.x  / this.BlockSize,
                origBlock.y / this.BlockSize,
                !origBlock.isRotated,
                true
            );
            $.each(rotateCoords, function(index, value) {
                var canThisMove = Vuetris.canMove(value.x, value.y);
                var isFilled    = Vuetris.isPositionFilled(value.x/Vuetris.BlockSize,value.y/Vuetris.BlockSize);
                if(isFilled) {
                    canMove = false;
                }
                if(!canThisMove) {
                    canMove = false;
                }
            });
            if(canMove) {
                this.rotateShape(
                    origBlock.blockType,
                    origBlock.x / this.BlockSize,
                    origBlock.y / this.BlockSize,
                    !origBlock.isRotated,
                    false
                );
            } else {
                this.rotateShape(
                    origBlock.blockType,
                    origBlock.x / this.BlockSize,
                    origBlock.y / this.BlockSize,
                    origBlock.isRotated,
                    false
                );
            }
        },
        /* creates shape (w/ rotation) or returns coords */
        rotateShape : function(blockType,x,y,isRotated,returnVals) {
            this.Block = [];
            switch(blockType) {
                case "block":
                default:
                    return Vuetris.newBlock(x,y,isRotated,returnVals);
                    break;
                case "l":
                    return Vuetris.newL(x,y,isRotated,returnVals);
                    break;
                case "line":
                    return Vuetris.newLine(x,y,isRotated,returnVals);
                    break;
                case "slant":
                    return Vuetris.newSlant(x,y,isRotated,returnVals);
                    break;
            }
        },
        /* checks grid boundaries */
        canMove: function(x, y) {
            if(
                x / this.BlockSize < 0 || x / this.BlockSize > this.MaxX
                || y / this.BlockSize < this.MinY || y / this.BlockSize > this.MaxY
            ) {
                return false;
            } else {
                return true;
            }
        },
        /* checks if space is filled */
        isPositionFilled: function(x,y) {
            var canReturn = false;
            if(this.Board.length > 0) {
                $.each(this.Board, function(xPoint, value) {
                    if(xPoint == x && value.length > 0) {
                        $.each(value, function(yPoint, value2) {
                            if(yPoint == y && value2 == 1) {
                                canReturn = true;
                            }
                        });
                    }
                });
            }
            return canReturn;
        },
        /* fills or unfills a coordinate */
        fillPosition: function(x,y,canUnfill) {
            var newBoard = [];
            $.each(this.Board, function(xPoint, yArray) {
                var newYArray = [];
                $.each(yArray, function(yPoint, value2) {
                    if(yPoint == y) {
                        if(xPoint == x && canUnfill) {
                            value2 = 0;
                        } else if(xPoint == x && !canUnfill) {
                            value2 = 1;
                        }
                    }
                    newYArray.push(value2);
                });
                newBoard.push(newYArray);
            });
            return newBoard;
        },
        /* completes a line after checking completeness */
        completeLine: function(y) {
            var incomplete = [];
            var lineCompleted = true;
            var lineEmpty = true;
            this.pause();

            for(i = 0; i < this.MaxX;) {
                var isFilled = this.isPositionFilled(i,y);
                if(!isFilled) {
                    lineCompleted = false;
                    incomplete.push(i);
                } else {
                    lineEmpty = false;
                }
                i++;
            }

            if(lineCompleted == true) {
                this.Blocks.concat(this.Block);
                $.each(this.Blocks, function(index, value) {
                    yPos = (value.y / Vuetris.BlockSize);
                    xPos = value.x / Vuetris.BlockSize;
                    if(yPos == y) {
                        Vuetris.Board = Vuetris.fillPosition(xPos,yPos,true);
                        value.y = ((Vuetris.MaxY+1)*Vuetris.BlockSize);
                    }
                });
                $.each(this.Blocks, function(index, value) {
                    yPos = (value.y / Vuetris.BlockSize);
                    xPos = value.x / Vuetris.BlockSize;
                    if(yPos <  y) {
                        Vuetris.Board = Vuetris.fillPosition(xPos,yPos,true);
                        value.y += Vuetris.BlockSize;
                        yPos++;
                        Vuetris.Board = Vuetris.fillPosition(xPos,yPos,false);
                    }
                });
                this.addPoints();
            }
            this.pause();
        },
        /* saves block to array */
        add: function (x,y,className,rotate) {
            this.Block.push({
                x:          x,
                y:          y,
                width:      this.BlockSize-1,
                height:     this.BlockSize-1,
                className:  this.BlockClass+" "+className,
                blockType:  className,
                isRotated:  rotate
            });
        },
        /* generates shapes */
        createShape: function(startX, startY, blockChoice) {
            // randomly choose shape if not chosen
            if(blockChoice == false) {
                blockChoice = Math.floor((Math.random() * 4) + 1);
            }
            // create shape
            switch(blockChoice) {
                case 4:
                    this.newSlant(startX,startY,false,false);
                    break;
                case 3:
                    this.newLine(startX,startY,false,false);
                    break;
                case 2:
                    this.newL(startX,startY,false,false);
                    break;
                case 1:
                default:
                    this.newBlock(startX,startY,false,false);
                    break;
            }
        },
        /* random x coordinate */
        newX: function() {
            return Math.floor((Math.random() * this.MaxX) + 0);
        },
        addPoints: function() {
            this.Score += this.PointVal;
            this.Text = [{text:this.ScoreText+this.Score,className:this.ScoreClass}]
        },
        /* resets blocks and board */
        reset: function() {
            if(this.Interval) {
                clearInterval(Vuetris.Interval);
                clearInterval(this.Interval);
                this.Interval = false;
            }
            this.Block      = [];
            this.Blocks     = [];
            this.Score      = 0;
            this.Text       = [{text: "SCORE: 0",className:this.ScoreClass}];
            this.Interval   = setInterval(function() { Vuetris.dropBlocks() },this.DropPace);
        },
        /* makes new square shape */
        newBlock: function(startX,startY,rotate,returnVals) {
            while(startX >= this.MaxX) {
                startX--;
            }
            var blockX  = startX * this.BlockSize;
            var blockY  = startY * this.BlockSize;
            var blockX2 = blockX + this.BlockSize;
            var blockY2 = blockY + this.BlockSize;

            if(!returnVals) {
                this.add(blockX,blockY,"block",rotate);
                this.add(blockX2,blockY,"block",rotate);
                this.add(blockX2,blockY2,"block",rotate);
                this.add(blockX,blockY2,"block",rotate);
            } else {
                return [
                    {x: blockX,  y: blockY},
                    {x: blockX2, y: blockY},
                    {x: blockX2, y: blockY2},
                    {x: blockX,  y: blockY2}
                ];
            }
        },
        /* makes new "L" shape */
        newL: function(startX,startY,rotate,returnVals) {
            while(startX > (this.MaxX-2)) {
                startX--;
            }
            var blockX = startX * this.BlockSize;
            var blockX2 = blockX + this.BlockSize;
            var blockY = startY * this.BlockSize;

            if(rotate == false) {
                var blockX3 = blockX2 + this.BlockSize;
                var blockY2 = blockY + this.BlockSize;

                if(!returnVals) {
                    this.add(blockX,blockY,"l",rotate);
                    this.add(blockX2,blockY,"l",rotate);
                    this.add(blockX3,blockY,"l",rotate);
                    this.add(blockX3,blockY2,"l",rotate);
                } else {
                    return [
                        {x: blockX,  y: blockY},
                        {x: blockX2, y: blockY},
                        {x: blockX3, y: blockY},
                        {x: blockX3, y: blockY2}
                    ];
                }
            } else {
                var blockX2 = blockX - this.BlockSize;
                var blockY2 = blockY + this.BlockSize;
                var blockY3 = blockY2 + this.BlockSize;
                if(!returnVals) {
                    this.add(blockX,blockY,"l",rotate);
                    this.add(blockX,blockY2,"l",rotate);
                    this.add(blockX,blockY3,"l",rotate);
                    this.add(blockX2,blockY3,"l",rotate);
                } else {
                    return [
                        {x: blockX, y: blockY},
                        {x: blockX, y: blockY2},
                        {x: blockX, y: blockY3},
                        {x: blockX2,y: blockY3}
                    ];
                }
            }
        },
        /* makes new "|" shape */
        newLine: function(startX,startY,rotate,returnVals) {
            while(startX > (this.MaxX-3)) {
                startX--;
            }
            var blockX  = startX * this.BlockSize;
            var blockY  = startY * this.BlockSize;

            if(rotate == true) {
                var blockY2 = blockY + this.BlockSize;
                var blockY3 = blockY2 + this.BlockSize;
                var blockY4 = blockY3 + this.BlockSize;
                if(!returnVals) {
                    this.add(blockX,blockY,"line",rotate);
                    this.add(blockX,blockY2,"line",rotate);
                    this.add(blockX,blockY3,"line",rotate);
                    this.add(blockX,blockY4,"line",rotate);
                } else {
                    return [
                        {x: blockX, y: blockY},
                        {x: blockX, y: blockY2},
                        {x: blockX, y: blockY3},
                        {x: blockX, y: blockY4}
                    ];
                }

            } else {
                var blockX2 = blockX + this.BlockSize;
                var blockX3 = blockX2 + this.BlockSize;
                var blockX4 = blockX3 + this.BlockSize;
                if(!returnVals) {
                    this.add(blockX,blockY,"line",rotate);
                    this.add(blockX2,blockY,"line",rotate);
                    this.add(blockX3,blockY,"line",rotate);
                    this.add(blockX4,blockY,"line",rotate);
                } else {
                    return [
                        {x: blockX,  y: blockY},
                        {x: blockX2, y: blockY},
                        {x: blockX3, y: blockY},
                        {x: blockX4, y: blockY}
                    ];
                }

            }
        },
        /* makes new "Z" shape */
        newSlant: function(startX,startY,rotate,returnVals) {
            while(startX > (this.MaxX-2)) {
                startX--;
            }
            var blockX = startX * this.BlockSize;
            var blockY = startY * this.BlockSize;

            if(rotate == false) {
                var blockX2 = blockX + this.BlockSize;
                var blockX3 = blockX2 + this.BlockSize;
                var blockY2 = blockY + this.BlockSize;
                if(!returnVals) {
                    this.add(blockX,blockY,"slant",rotate);
                    this.add(blockX2,blockY,"slant",rotate);
                    this.add(blockX2,blockY2,"slant",rotate);
                    this.add(blockX3,blockY2,"slant",rotate);
                } else {
                    return [
                        {x: blockX,  y: blockY},
                        {x: blockX2, y: blockY},
                        {x: blockX2, y: blockY2},
                        {x: blockX3, y: blockY2}
                    ];
                }
            } else {
                var blockY2 = blockY + this.BlockSize;
                var blockY3 = blockY2 + this.BlockSize;
                var blockX2 = blockX + this.BlockSize;
                if(!returnVals) {
                    this.add(blockX,blockY,"slant",rotate);
                    this.add(blockX,blockY2,"slant",rotate);
                    this.add(blockX2,blockY2,"slant",rotate);
                    this.add(blockX2,blockY3,"slant",rotate);
                } else {
                    return [
                        {x: blockX,  y: blockY},
                        {x: blockX,  y: blockY2},
                        {x: blockX2, y: blockY2},
                        {x: blockX2, y: blockY3}
                    ];
                }
            }
        }
    }
});