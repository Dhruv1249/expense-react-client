/*
 * JSX is the combination of HTML, CSS and JavaScript code.
 * It's an extension created by react.
 *
 * Every component must return single parent node which
 * will be rendered.
 */

function Student({ name = "Tommy", rollNumber = 10 }) {
  return (
    <>
      <p>
        Student name: {name}
        <br />
        Roll Number: {rollNumber}
      </p>
    </>
  );
}

export default Student;
