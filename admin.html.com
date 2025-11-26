<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HNN Admin — Edit Site</title>
<style>
  body{font-family:system-ui;background:#f4f4f4;padding:2rem;color:#222}
  .panel{max-width:900px;margin:auto;background:white;padding:2rem;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.1)}
  input,select,textarea{width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:6px;font-size:1rem}
  label{font-weight:bold;margin-top:1rem;display:block}
  button{padding:12px 24px;background:#0066cc;color:white;border:none;border-radius:6px;cursor:pointer;font-size:1.1rem}
  button:hover{background:#0055aa}
  .slide{margin:2rem 0;padding:1rem;background:#fafafa;border-radius:8px}
  .pin-screen{text-align:center;margin-top:100px}
  input[type=color]{height:60px}
</style>
</head>
<body>

<div id="pinScreen" class="pin-screen">
  <h1>Honest News Network Admin</h1>
  <p>Enter 6-digit PIN:</p>
  <input type="password" id="pinInput" maxlength="6" size="6" style="font-size:2rem;text-align:center;letter-spacing:8px">
  <button onclick="checkPin()">Enter</button>
</div>

<div id="panel" class="panel" style="display:none">
  <h1>Live Site Editor</h1>

  <label>Change Admin PIN (6 digits)</label>
  <input type="text" id="newPin" maxlength="6" placeholder="New 6-digit PIN">

  <label>Primary Button Color</label>
  <input type="color" id="primaryColor">

  <label>Header Background</label>
  <input type="color" id="headerBg">

  <label>Body Text Color</label>
  <input type="color" id="textColor">

  <label>Google Font Name (e.g. Playfair Display)</label>
  <input type="text" id="fontName" placeholder="Playfair Display">

  <h2 style="margin-top:3rem">Hero Carousel Slides</h2>
  <div id="slides"></div>
  <button onclick="addSlide()">+ Add New Slide</button>

  <button onclick="saveAll()" style="margin-top:2rem">SAVE ALL CHANGES TO LIVE SITE</button>
  <p id="status" style="margin-top:1rem;font-weight:bold"></p>
</div>

<script>
let data = {};

async function checkPin() {
  const res = await fetch("data.json?" + Date.now());
  data = await res.json();
  if (document.getElementById("pinInput").value === data.pin) {
    document.getElementById("pinScreen").style.display = "none";
    document.getElementById("panel").style.display = "block";
    loadData();
  } else {
    alert("Wrong PIN");
  }
}

function loadData() {
  document.getElementById("newPin").value = "";
  document.getElementById("primaryColor").value = data.primaryColor;
  document.getElementById("headerBg").value = data.headerBg;
  document.getElementById("textColor").value = data.textColor;
  document.getElementById("fontName").value = data.fontName;

  const container = document.getElementById("slides");
  container.innerHTML = "";
  data.heroSlides.forEach((s,i) => addSlideToPanel(s, i));
}

function addSlideToPanel(s, i) {
  const div = document.createElement("div");
  div.className = "slide";
  div.innerHTML = `
    <input placeholder="Title (use <br> for line break)" value="${s.title}">
    <input placeholder="Subtitle" value="${s.subtitle}">
    <input placeholder="Button text" value="${s.buttonText}">
    <input placeholder="Button link" value="${s.buttonLink}">
    <input placeholder="Image URL" value="${s.image}" style="width:100%">
    <button onclick="this.parentElement.remove();saveAll()">Delete</button>
    <hr>
  `;
  document.getElementById("slides").appendChild(div);
}

function addSlide() {
  addSlideToPanel({
    title: "New Slide",
    subtitle: "Subtitle here",
    buttonText: "Click Here",
    buttonLink: "#",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop"
  });
}

async function saveAll() {
  // Update PIN if changed
  const newPin = document.getElementById("newPin").value.trim();
  if (newPin && newPin.length === 6) data.pin = newPin;

  data.primaryColor = document.getElementById("primaryColor").value;
  data.headerBg = document.getElementById("headerBg").value;
  data.textColor = document.getElementById("textColor").value;
  data.fontName = document.getElementById("fontName").value;
  data.font = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(data.fontName.replace(/ /g,'+'))}:wght@400;700&display=swap`;

  // Rebuild slides
  data.heroSlides = [];
  document.querySelectorAll("#slides .slide").forEach(el => {
    const inputs = el.querySelectorAll("input");
    data.heroSlides.push({
      title: inputs[0].value,
      subtitle: inputs[1].value,
      buttonText: inputs[2].value,
      buttonLink: inputs[3].value,
      image: inputs[4].value
    });
  });

  // In the next step we'll add the real GitHub API save — for now it just shows success
  document.getElementById("status").textContent = "All changes ready! (GitHub save coming in next message)";
  console.log("New data.json content:", JSON.stringify(data, null, 2));
}
</script>
</body>
</html>
