import { useState } from "react";

function Student5(){
    const [visible, setVisible] = useState(true);
    const [buttonText, setButtonText] = useState("Hide Students");

    const StudentList = [
        {name: "Tommy", rollNumber:1},
        {name: "Tuffy", rollNumber:2},
        {name: "Jimmy", rollNumber:3},
        {name: "Pluto", rollNumber:4},
    ];

    const handleClick = () => {
        setVisible(()=>{
            setButtonText(!visible?'Hide Students':'Display Students');
            return !visible;
        });
    };
    return(
        <div>
            <button onClick={handleClick}>{buttonText}</button>
            
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

export default Student5;