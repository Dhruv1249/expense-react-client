/**
 * 
 * jsx is combination of HTML, CSS and JAvascript code 
 * Its a extension created by React
 * Every component must return single parent node which will be renderd
 * 
 */
function Student() {
    let name = "Tommy";
    let rollNumber = 10;
    return(
        <>
        <p>
            Student Name: {name}
            <br/>
            Roll Number: {rollNumber}
        </p>
        </>
    );
}
export default Student