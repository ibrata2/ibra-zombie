module.exports = [
  { name: 'a-title', wait: 1500 },
  { name: 'b-home', js: "await __iz.startNew('ابراهيم', true); return JSON.stringify({b:__iz.World.buildings.length,c:__iz.World.containers.length,p:__iz.World.props.length,z:__iz.R.zombies.length})", wait: 1200 },
  { name: 'c-door', js: "const G=__iz.G,S=__iz.S; G.x=S.homeDoor.x; G.y=S.homeDoor.y; ", wait: 1200 },
  { name: 'd-zoomout', js: "__iz.G.zoom=2;", wait: 1200 },
];
