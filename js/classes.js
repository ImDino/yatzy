class Player {
    constructor(playerID,name){
        this.playerID = playerID;
        this.name = name;      
        this.sum = 0;
        this.bonus = 0;
        this.total = 0;

        this.upperScore = {
            ones: 0,
            twos: 0,
            threes: 0,
            fours: 0,
            fives: 0,
            sixes: 0
        };

        this.lowerScore = {
            pair: 0,
            twoPairs: 0,
            threeKind: 0,
            fourKind: 0,
            sStraight: 0,
            bStraight: 0,
            fullHouse: 0,
            chance: 0,
            yatzy: 0
        }
    }
    CountSum() {
        this.sum = 0;
        for (var number in this.upperScore){
            this.sum += parseInt( this.upperScore[number] );
        }
        return parseInt( this.sum );
    }
    CountTotal() {
        this.total = 0;
        for (var number in this.lowerScore){
            this.total += parseInt( this.lowerScore[number] );
        }
        this.total += this.sum;
        this.total += this.bonus;
        return parseInt( this.total );
    }
}