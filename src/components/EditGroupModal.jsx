import axios from "axios";
import { useState, useEffect } from "react";
import { serverEndpoint } from "../config/appConfig";

function EditGroupModal({ show, onHide, onSuccess, group }) {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});

  // Populate form when group changes
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || ""
      });
    }
  }, [group]);

  const validate = () => {
    let isValid = true;
    const newErrors = {};
    if (formData.name.length < 3) {
      newErrors.name = "Name must be atleast 3 characters long";
      isValid = false;
    }
    if (formData.description.length < 3) {
      newErrors.description = "Description must be atleast 3 characters long";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.put(
          `${serverEndpoint}/groups/update`,
          {
            groupId: group._id,
            name: formData.name,
            description: formData.description,
          },
          { withCredentials: true }
        );
        onSuccess(response.data);
        onHide();
      } catch (error) {
        setErrors({ message: "Unable to update group, please try again" });
      }
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow">
          <form onSubmit={handleSubmit}>
            <div className="modal-header border-0 pb-0 p-4">
              <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                  <i className="bi bi-pencil-square text-success fs-4"></i>
              </div>
              <h5 className="fw-bold mb-0">Edit Group Settings</h5>
              <button
                type="button"
                className="btn-close shadow-none"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body px-4 py-4">
              {errors.message && (
                <div className="alert alert-danger alert-dismissible fade show border-0 small" role="alert">
                  {errors.message}
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
              )}
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary text-uppercase">Group Name</label>
                <input
                  type="text"
                  className={`form-control form-control-lg bg-light border-0 fs-6 ${
                    errors.name ? "is-invalid" : ""
                  }`}
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold text-secondary text-uppercase">Description</label>
                <textarea
                  className={`form-control form-control-lg bg-light border-0 fs-6 ${
                    errors.description ? "is-invalid" : ""
                  }`}
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={onChange}
                ></textarea>
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>
            </div>
            <div className="modal-footer border-0 px-4 pb-4">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4 fw-medium"
                onClick={onHide}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success rounded-pill px-5 fw-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditGroupModal;
