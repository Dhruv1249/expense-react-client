function UserCard(props){
    return(
        <>
        <p>{props.name}</p>
        {props.isPremium &&(
            <p>Premium Member</p>
        )}
        {!props.isPremium &&(
            <p>Standard member</p>
        )}

        </>
    );
}
export default UserCard;