import Student3 from "./Student3.jsx";

function StduentList({ stduents }) {
  return (
    <>
      <h2>Stduent List</h2>
      {stduents.map((student, index) => (
        <Student3
          key={index}
          name={student.name}
          rollNumber={student.rollNumber}
          percentage={student.percentage}
        />
      ))}
    </>
  );
}

export default StduentList;
