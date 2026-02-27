import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC17R6vlTFRdU4lRTGL0knCefnYsnihjbE",
    authDomain: "sistema-mecanica-343b7.firebaseapp.com",
    projectId: "sistema-mecanica-343b7",
    storageBucket: "sistema-mecanica-343b7.firebasestorage.app",
    messagingSenderId: "1012860187609",
    appId: "1:1012860187609:web:4a9a5c424c219a60549fc8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    gerarNumeroOS();
    mostrarData();
    adicionarServico();
});

function gerarNumeroOS() {
    document.getElementById("numeroOS").innerText =
        Math.floor(Math.random() * 100000);
}

function mostrarData() {
    document.getElementById("dataAtual").innerText =
        new Date().toLocaleDateString("pt-BR");
}

window.adicionarServico = function () {
    const div = document.createElement("div");

    div.innerHTML = `
    <input type="text" placeholder="Descrição">
    <input type="number" placeholder="Valor" oninput="calcularTotal()">
    <button onclick="this.parentElement.remove(); calcularTotal();" 
        class="btn-remove">X</button>
  `;

    document.getElementById("servicos").appendChild(div);
};

window.calcularTotal = function () {
    const valores = document.querySelectorAll('#servicos input[type="number"]');
    let total = 0;

    valores.forEach(input => {
        total += Number(input.value) || 0;
    });

    document.getElementById("valorTotal").innerText = total.toFixed(2);
};

window.salvarOS = async function () {
    const servicos = [];
    document.querySelectorAll("#servicos div").forEach(div => {
        const inputs = div.querySelectorAll("input");
        servicos.push({
            descricao: inputs[0].value,
            valor: inputs[1].value
        });
    });

    await addDoc(collection(db, "ordens"), {
        numeroOS: document.getElementById("numeroOS").innerText,
        data: document.getElementById("dataAtual").innerText,
        nome: nome.value,
        telefone: telefone.value,
        endereco: endereco.value,
        placa: placa.value,
        km: km.value,
        servicos,
        total: valorTotal.innerText
    });

    alert("OS salva online com sucesso!");
};

window.listarOS = async function () {
    const querySnapshot = await getDocs(collection(db, "ordens"));
    let html = "<h3>Histórico</h3>";

    querySnapshot.forEach(doc => {
        const os = doc.data();
        html += `
      <div style="border-bottom:1px solid #ccc; margin-bottom:10px;">
        <p><strong>OS:</strong> ${os.numeroOS}</p>
        <p><strong>Cliente:</strong> ${os.nome}</p>
        <p><strong>Total:</strong> R$ ${os.total}</p>
      </div>
    `;
    });

    document.getElementById("historico").innerHTML = html;
};

window.gerarImagem = function () {
    const btnAdd = document.getElementById("btnAdd");
    btnAdd.style.display = "none";

    html2canvas(document.getElementById("ordemServico")).then(canvas => {
        const link = document.createElement("a");
        link.download = "ordem-servico.png";
        link.href = canvas.toDataURL();
        link.click();
        btnAdd.style.display = "block";
    });
};