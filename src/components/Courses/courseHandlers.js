export const showAlert = (setAlert) => (type, title, message) => {
  setAlert({ type, title, message });
};

export const handleThumbnailUpload = (setThumbnail, showAlert) => (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      showAlert(
        "error",
        "Erreur",
        "Le fichier est trop volumineux. Maximum 10MB."
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnail(e.target.result);
      showAlert("success", "Succès", "Miniature téléchargée avec succès!");
    };
    reader.readAsDataURL(file);
  }
};

export const handleVideoFileSelect =
  (newVideo, setNewVideo, showAlert) => (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        showAlert(
          "error",
          "Erreur",
          "Le fichier vidéo est trop volumineux. Maximum 500MB."
        );
        return;
      }
      setNewVideo({ ...newVideo, file });
    }
  };

export const handleVideoUpload = async (
  newVideo,
  setNewVideo,
  setVideos,
  videos,
  setIsUploading,
  setUploadProgress,
  showAlert
) => {
  if (!newVideo.file || !newVideo.name.trim()) {
    showAlert(
      "warning",
      "Attention",
      "Veuillez remplir tous les champs et sélectionner une vidéo."
    );
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);

  const progressInterval = setInterval(() => {
    setUploadProgress((prev) => {
      if (prev >= 90) {
        clearInterval(progressInterval);
        return prev;
      }
      return prev + Math.random() * 20;
    });
  }, 200);

  setTimeout(() => {
    clearInterval(progressInterval);
    setUploadProgress(100);

    const newVideoData = {
      id: Date.now(),
      name: newVideo.name,
      description:
        newVideo.description || `Description pour la vidéo: ${newVideo.name}`,
      url: URL.createObjectURL(newVideo.file),
      uploaded: true,
    };

    setVideos([...videos, newVideoData]);
    setNewVideo({ name: "", description: "", file: null });
    setIsUploading(false);
    setUploadProgress(0);

    const fileInput = document.getElementById("video-file-input");
    if (fileInput) fileInput.value = "";

    showAlert("success", "Succès", "Vidéo téléchargée avec succès!");
  }, 1000);
};

export const handleEditVideo =
  (videos, setVideos, showAlert) => (videoId, newData) => {
    setVideos(
      videos.map((video) =>
        video.id === videoId
          ? { ...video, name: newData.name, description: newData.description }
          : video
      )
    );
    showAlert("success", "Succès", "Vidéo modifiée avec succès!");
  };

export const handleDeleteVideo =
  (videos, setVideos, showAlert) => (videoId) => {
    setVideos(videos.filter((video) => video.id !== videoId));
    showAlert("success", "Succès", "Vidéo supprimée avec succès!");
  };

export const handleAddObjective =
  (newObjective, setObjectives, objectives, setNewObjective, showAlert) =>
  () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
      showAlert("success", "Succès", "Objectif ajouté avec succès!");
    }
  };

export const handleRemoveObjective =
  (objectives, setObjectives, showAlert) => (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
    showAlert("success", "Succès", "Objectif supprimé avec succès!");
  };

export const handleEditObjective =
  (setEditingObjective, setEditingText, objectives) => (index) => {
    setEditingObjective(index);
    setEditingText(objectives[index]);
  };

export const handleSaveObjective =
  (
    editingText,
    editingObjective,
    objectives,
    setObjectives,
    setEditingObjective,
    setEditingText,
    showAlert
  ) =>
  () => {
    if (editingText.trim()) {
      const updatedObjectives = [...objectives];
      updatedObjectives[editingObjective] = editingText.trim();
      setObjectives(updatedObjectives);
      showAlert("success", "Succès", "Objectif modifié avec succès!");
    }
    setEditingObjective(null);
    setEditingText("");
  };

export const handleCancelEdit = (setEditingObjective, setEditingText) => () => {
  setEditingObjective(null);
  setEditingText("");
};

export const handleDiscountToggle = (values, setFieldValue) => () => {
  setFieldValue("hasDiscount", !values.hasDiscount);
};

export const handlePublish = async (
  courseData,
  videos,
  setIsPublishing,
  showAlert
) => {
  if (
    !courseData.title.trim() ||
    !courseData.description.trim() ||
    videos.length === 0
  ) {
    showAlert(
      "warning",
      "Attention",
      "Veuillez remplir tous les champs obligatoires et ajouter au moins une vidéo."
    );
    return;
  }

  setIsPublishing(true);
  setTimeout(() => {
    setIsPublishing(false);
    showAlert(
      "success",
      "Félicitations!",
      "Votre cours a été publié avec succès!"
    );
  }, 3000);
};
