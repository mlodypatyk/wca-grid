type Props = {
    rating: number
}

type Rating = {
    name: string,
    emoji: string,
    color: string
}

const getRating = function (rating: number) : Rating {
    if (rating < 0.025){
        return {
            name: 'Mythical',
            emoji: '🦄', 
            color: '#800080'
        }
    }
    if (rating < 0.05){
        return {
            name: 'Epic',
            emoji: '🌈',
            color: '#DD70C5'
        }
    }
    if (rating < 0.1){
        return {
            name: 'Rare',
            emoji: '⚡️',
            color: '#9670DD'
        }
    }
    if (rating < 0.2){
        return {
            name: 'Uncommon',
            emoji: '🔷',
            color: '#3C64B4'
        }
    }
    return {
        name: 'Common',
        emoji: '🟩',
        color: '#65D065'
    }

}

export default function GuessRating({rating} : Props) {
    var localrating = getRating(rating);
    return (
        <div className="percent-display" style={{backgroundColor: localrating.color}}>{localrating.emoji} {Math.round(rating*1000)/10}%</div>
    )
}