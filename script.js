import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
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
<button onclick="this.parentElement.remove(); calcularTotal();" class="btn-remove">X</button>
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

    alert("OS salva com sucesso!");

    listarOS();

    limparFormulario();

};

window.listarOS = async function () {

    const q = query(collection(db, "ordens"), orderBy("numeroOS", "desc"));

    const querySnapshot = await getDocs(q);

    let html = "";

    querySnapshot.forEach(documento => {

        const os = documento.data();
        const id = documento.id;

        // montar lista de serviços
        let listaServicos = "";

        if (os.servicos && os.servicos.length > 0) {

            os.servicos.forEach(servico => {

                listaServicos += `
                <li>
                ${servico.descricao} - R$ ${Number(servico.valor).toFixed(2)}
                </li>
                `;

            });

        }

        html += `
<div class="card-os">

<p><strong>OS Nº:</strong> ${os.numeroOS}</p>
<p><strong>Data:</strong> ${os.data}</p>

<p><strong>Cliente:</strong> ${os.nome}</p>
<p><strong>Telefone:</strong> ${os.telefone}</p>

<p><strong>Placa:</strong> ${os.placa}</p>
<p><strong>KM:</strong> ${os.km}</p>

<p><strong>Serviços realizados:</strong></p>

<ul class="lista-servicos">
${listaServicos}
</ul>

<p><strong>Total:</strong> R$ ${os.total}</p>

<button onclick="excluirOS('${id}')" class="btn-excluir">
Excluir OS
</button>

<a href="https://wa.me/55${os.telefone}?text=Sua ordem de serviço foi registrada no sistema." target="_blank" class="btn-whatsapp">
Enviar WhatsApp
</a>

</div>
`;

    });

    document.getElementById("historicoConteudo").innerHTML = html;

    document.getElementById("painelHistorico").classList.add("ativo");

};

window.excluirOS = async function (id) {

    const confirmar = confirm("Deseja realmente excluir esta OS?");

    if (!confirmar) return;

    await deleteDoc(doc(db, "ordens", id));

    alert("OS excluída com sucesso!");

    listarOS();

};

window.gerarImagem = function () {

    const botoesRemover = document.querySelectorAll(".btn-remove");
    botoesRemover.forEach(btn => btn.style.display = "none");

    const btnAdd = document.getElementById("btnAdd");
    btnAdd.style.display = "none";

    const acoes = document.querySelector(".acoes");
    acoes.style.display = "none";

    html2canvas(document.querySelector(".container"), {
        scale: 2
    }).then(canvas => {

        const link = document.createElement("a");

        link.download = "ordem-servico.png";

        link.href = canvas.toDataURL();

        link.click();

        botoesRemover.forEach(btn => btn.style.display = "inline-block");

        btnAdd.style.display = "inline-block";

        acoes.style.display = "block";

    });

};

function limparFormulario() {

    nome.value = "";
    telefone.value = "";
    endereco.value = "";
    placa.value = "";
    km.value = "";

    document.getElementById("servicos").innerHTML = "";

    document.getElementById("valorTotal").innerText = "0.00";

    gerarNumeroOS();

    adicionarServico();

}

window.fecharHistorico = function () {

    document.getElementById("painelHistorico").classList.remove("ativo");

};

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("service-worker.js")
        .then(() => console.log("Service Worker registrado"));

}

window.filtrarOS = function () {

    const busca = document.getElementById("buscarOS").value.toLowerCase();

    const cards = document.querySelectorAll(".card-os");

    cards.forEach(card => {

        const texto = card.innerText.toLowerCase();

        card.style.display = texto.includes(busca) ? "block" : "none";

    });

}

window.gerarPDF = function () {

    const botoesRemover = document.querySelectorAll(".btn-remove");
    botoesRemover.forEach(btn => btn.style.display = "none");

    const btnAdd = document.getElementById("btnAdd");
    btnAdd.style.display = "none";

    const acoes = document.querySelector(".acoes");
    acoes.style.display = "none";

    html2canvas(document.querySelector(".container"), {
        scale: 2
    }).then(canvas => {

        const imgData = canvas.toDataURL("image/png");

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF("p", "mm", "a4");

        const larguraPDF = 210;
        const alturaPDF = (canvas.height * larguraPDF) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 10, larguraPDF, alturaPDF);

        pdf.save("ordem-servico.pdf");

        botoesRemover.forEach(btn => btn.style.display = "inline-block");

        btnAdd.style.display = "inline-block";

        acoes.style.display = "block";

    });

};