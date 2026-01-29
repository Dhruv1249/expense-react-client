function UserCard(props) {
  return (
    <>
      <h1>Name: {props.name}</h1>
      {props.isPremium && <p>Status: VIP Member</p>}
      {!props.isPremium && <p>Status: "Standard Member"</p>}
      <p>
        Age: {props.age}
        <br />
        location: {props.location}
      </p>
    </>
  );
}

export default UserCard;
