import {useEffect, useState} from 'react'

const LeaderBoardItem = (item : any) => {
    return (
        <div className="leaderboard-item">
            <h1>{item.position}</h1>
            <p>{item.address}</p>
        </div>
    )

}

export const Leaderboard = () => {
    const rows = [
        {
            position: 1,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        },
        {
            position: 2,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        },
        {
            position: 3,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        },
        {
            position: 4,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        },
        {
            position: 5,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        },
        {
            position: 6,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        }
        , {
            position: 7,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        },
        {
            position: 8,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        },
        {
            position: 9,
            address: 'kiuyyeihvvbbkasdfkjhkbvcwueyvcuvkjsvdcvakvewr',
        }
    ]
    const [showModal, setShowModal] = useState(false)
    useEffect(() => {}, [])

    return (
        <div>
            <p className="my-auto mr-10 hover:cursor-pointer" onClick={() => setShowModal(true)}>Leaderboard</p>
            {showModal &&
                <div className="leaderboard-modal">
                    <div className="leaderboard-modal-body">
                        <a onClick={() => setShowModal(false)}>Close</a>
                        <div className="leaderboard-list">
                            {rows.map(item => <LeaderBoardItem key={item.position} item={item}/>)}
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
