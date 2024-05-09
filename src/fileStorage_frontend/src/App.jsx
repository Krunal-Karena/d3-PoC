import React from "react";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import './assets/app.css'
import { fileStorage_backend } from 'declarations/fileStorage_backend';

const App = () => {

  return (
    <div>
      <FileUpload ></FileUpload>
      <FileList ></FileList>
    </div>
  );
};

export default App;
