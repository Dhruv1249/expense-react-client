import { useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
function CreateGroupModal({ show, onHide ,onSuccess}) {
  
  if(!show) return null;

   const [formData, setFormData] = useState({
     name: "",
     description: "",
   });
    const [error, setError] = useState({});

    const validate = () => {
      let isValid = true;

      const newError = {};

      if(formData.name.length < 3){
        newError.name = "Name should be atleast 3 characters long";
        isValid = false;
      }

      if(formData.description.length < 3){
        newError.description = "Description should be atleast 3 characters long";
        isValid = false;
      }

      setError(newError);
      return isValid;
  };
  const onChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {

      try {
        await axios.post(
          `${serverEndpoint}/groups/create`,
          {name: formData.name, description: formData.description},
          {withCredentials: true}
        );
        onSuccess();
        onHide();
      } catch (error) {
        console.log(error);
      }
    }
  }
  return (
    <div className="modal show d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow">
          <form>
            <div className="modal-header border-0">
              <h5>Create Group</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label  className="form-label small fw-bold">
                  Group Name
                </label>
                <input
                  type="text"
                  className={error.name ? "form-control is-invalid" : "form-control"}
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  placeholder="Enter group name"
                />
              {error.name && <div className="invalid-feedback">{error.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Group Description
                </label>
                <textarea
                  className={error.description ? "form-control is-invalid" : "form-control"}
                  name="description"
                  value={formData.description}
    onChange={onChange}
                  rows="3"
                  placeholder="Enter group description"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
