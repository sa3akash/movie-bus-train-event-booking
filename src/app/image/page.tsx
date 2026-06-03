import Image from "next/image";
import React from "react";

const ImageUploadPage = () => {
  const handleImageUpload = () => {};
  return (
    <div>
      <h1>Image Upload</h1>
      <div>
        <Image
          src={
            "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAADwBACdASogACAAPqlGnkmmJCMhMAwAwBUJZACdMtDDTpduMcnYS15/OtsRc+h93ZgA/owVUOlMKvANo7s4DcMd4ESW2v8tu50EGaYqgJ55BrWlpJqcMoGl2l4sTDyS23/rpn/L9f+ZeLWAkqR5ziAA"
          }
          alt="Image"
          width={500}
          height={500}
          blurDataURL="data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAADwBACdASogACAAPqlGnkmmJCMhMAwAwBUJZACdMtDDTpduMcnYS15/OtsRc+h93ZgA/owVUOlMKvANo7s4DcMd4ESW2v8tu50EGaYqgJ55BrWlpJqcMoGl2l4sTDyS23/rpn/L9f+ZeLWAkqR5ziAA"
        />
      </div>
    </div>
  );
};

export default ImageUploadPage;
