 import { useSelector } from 'react-redux';
function Dashboard(){
    const user = useSelector((state) => state.userDetails);
return(
<div className="container text-center">
    <h4>Welome {user.name}</h4>
</div>
)
    
};
export default Dashboard;