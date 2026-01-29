import { useState } from "react";

function Student4() {
  const [visible, setVisible] = useState(true);
  const [buttonText, setButtonText] = useState("Hide Students");
  const studentList = [
    { name: "Tommy", rollNumber: 10 },
    { name: "Tobias", rollNumber: 7 },
    { name: "Patrick", rollNumber: 1 },
  ];

  const handleClick = () => {
    setVisible(!visible);
    if (visible) {
      setButtonText("Hide Students");
    } else {
      setButtonText("Display Students");
    }
  };

  return (
    <div>
      <button onClick={handleClick}>{buttonText}</button>
      <div></div>
      {visible && (
        <>
          {studentList.map((s) => (
            <p>
              Roll Number: {s.rollNumber}
              <br />
              Name: {s.name}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

export default Student4;
