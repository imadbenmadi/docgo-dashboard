import Swal from "sweetalert2";

const showAlert = (type, title, text) => {
  if (type === "success") {
    Swal.fire({
      icon: "success",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
      timer: 1500,
      showConfirmButton: false,
    });
  }
  if (type === "error") {
    Swal.fire({
      icon: "error",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
    });
  }
  if (type === "warning") {
    Swal.fire({
      icon: "warning",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
    });
  }
  if (type === "info") {
    Swal.fire({
      icon: "info",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
    });
  }
  if (type === "question") {
    Swal.fire({
      icon: "question",
      title: title,
      text: text,
      confirmButtonColor: "#3b82f6",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
    });
  }
  if (type === "loading") {
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }
  if (type === "close") {
    Swal.close();
  }
};

export default showAlert;
