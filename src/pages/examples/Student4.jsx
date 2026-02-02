import { useState } from "react";

function Student4(){
    const [visible, setVisible] = useState(true);

    const StudentList = [
        {name: "Tommy", rollNumber:1},
        {name: "Tuffy", rollNumber:2},
        {name: "Jimmy", rollNumber:3},
        {name: "Pluto", rollNumber:4},
    ];

    const handleClick = () => {
        if(visible === false){
        setVisible(true);

        }
        else{
            setVisible(false);
        }
    }
    return(
        <div>
            {visible && <button onClick={handleClick}>Hide Students</button>}
            {!visible && <button onClick={handleClick}>Show Students</button>}
            
            {visible && (
                <>
                    {StudentList.map((s) => (
                        <p key={s.rollNumber}>
                            Roll Number: {s.rollNumber}
                            <br></br>
                            Name: {s.name}
                        </p>
                    ))}
                </>
            )}

        </div>
    );
}

export default Student4;