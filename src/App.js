import React, { Component } from "react";
import ParticlesBg from "particles-bg";
import Navigation from "./components/Navigation/Navigation";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import "./App.css";

const returnClarifaiRequestOptions = (imageUrl) => {
  const PAT = "1b5a82fb7d1d43ee8f1387ce89306f09";
 
  const USER_ID = "5aemn7ogrqkn";
  const APP_ID = "test";
 
  // const MODEL_ID = "face-detection";

  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
    },
    body: raw,
  };
  return requestOptions;
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: 'SignIn',
      isSignedIn: false,
      user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: ""
      }
    };
  }

  loadUser = (data) => {
this.setState({user: {
  id: data.id,
  name: data.name,
  email: data.email,
  entries: data.entries,
  joined: data.joined
  }})
  }


componentDidMount(){
  fetch('http://localhost:3000/')
  .then(response =>response.json())
  .then(console.log)
}


  calculateFaceLocation = (data) => {
     
    const clarifaiFace =
    data.outputs[0].data.regions[0].region_info.bounding_box;
    // console.log(clarifaiFace);
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    // this.setState({input: event.target.value});
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * width,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box: box });
    console.log(this.state.box);
  };

  onInputChange = (event) => {
    // console.log(event.target.value);
    this.setState({ input: event.target.value });
    // console.log(this.input);
  };

  onButtonSubmit = () => {
    // console.log('111111');
    // console.log(this.state.input);
    this.setState({ imageUrl: this.state.input });
    // console.log(this.state.imageUrl);
    fetch(
      "https://api.clarifai.com/v2/models/face-detection/outputs",
 returnClarifaiRequestOptions(this.state.input))
      .then(response =>response.json())
    .then(response =>{
      if(response){
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
         this.setState(Object.assign(this.state.user, {entries:count})) 
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
      .catch((err) => console.log(err));

    // console.log("click");
  };

onRouteChange = (route) => {
  if(route==='signout'){
    this.setState({isSignedIn : false})
  } else if(route==='home'){
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
}

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
      <ParticlesBg type="fountain" bg={{
                position: "fixed",
                zIndex: -1,
                top: 0,
                left: 0,
            }} />
        <Navigation isSignedIn ={isSignedIn} onRouteChange={this.onRouteChange}/>
        {
         route==='home'
          ?
          <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>:
        (
          route ==='SignIn'?
          <SignIn loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
          :<Register loadUser ={this.loadUser} onRouteChange = {this.onRouteChange}/>
          
        )
        
  }
      </div>
    );
  }
}
export default App;
