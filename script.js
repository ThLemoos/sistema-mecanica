import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    updateDoc
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
let idEditando = null;

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

    const dados = {
        numeroOS: numeroOS.innerText,
        data: dataAtual.innerText,

        nome: nome.value,
        telefone: telefone.value,
        endereco: endereco.value,
        placa: placa.value,
        km: km.value,
        marca: marca.value,

        observacoes: document.getElementById("observacoes").value,

        servicos,
        total: valorTotal.innerText
    };

    if (idEditando) {

        await updateDoc(doc(db, "ordens", idEditando), dados);

        alert("OS atualizada com sucesso!");

        idEditando = null;

    } else {

        await addDoc(collection(db, "ordens"), dados);

        alert("OS salva com sucesso!");

    }

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
<p><strong>Marca:</strong> ${os.marca || ""}</p>

<p><strong>Serviços realizados:</strong></p>

<ul class="lista-servicos">
${listaServicos}
</ul>

<p><strong>Total:</strong> R$ ${os.total}</p>

<p><strong>Observações:</strong><br>
${os.observacoes ? os.observacoes : "Nenhuma observação informada."}
</p>

<button onclick="editarOS('${id}')" class="btn-editar">
Editar
</button>

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
    marca.value = "";

    document.getElementById("servicos").innerHTML = "";

    document.getElementById("valorTotal").innerText = "0.00";

    document.getElementById("observacoes").value = "";

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

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const numeroOS = document.getElementById("numeroOS").innerText;
    const data = document.getElementById("dataAtual").innerText;

    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const endereco = document.getElementById("endereco").value;
    const placa = document.getElementById("placa").value;
    const km = document.getElementById("km").value;
    const marca = document.getElementById("marca").value;

    const observacoes = document.getElementById("observacoes").value;

    const total = document.getElementById("valorTotal").innerText;

    let y = 20;

    doc.setFontSize(18);
    doc.text("ORDEM DE SERVIÇO", 105, y, { align: "center" });

    y += 10;

    doc.text("Oficina Sempre 80km/h", 105, y, { align: "center" });

    y += 10;

    doc.setFontSize(11);
    doc.text("OS Nº: " + numeroOS, 20, y);
    doc.text("Data: " + data, 150, y);

    y += 15;

    doc.setFontSize(14);
    doc.text("DADOS DO CLIENTE", 20, y);

    y += 8;

    doc.setFontSize(11);
    doc.text("Nome: " + nome, 20, y);
    y += 7;

    doc.text("Telefone: " + telefone, 20, y);
    y += 7;

    doc.text("Endereço: " + endereco, 20, y);
    y += 7;

    doc.text("Placa: " + placa, 20, y);
    y += 7;

    doc.text("KM: " + km, 20, y);

    y += 7;

    doc.text("Marca da Moto: " + marca, 20, y);

    y += 15;

    doc.setFontSize(14);
    doc.text("SERVIÇOS", 20, y);

    y += 8;

    doc.setFontSize(11);

    document.querySelectorAll("#servicos div").forEach(div => {

        const inputs = div.querySelectorAll("input");

        const descricao = inputs[0].value;
        const valor = Number(inputs[1].value).toFixed(2);

        doc.text(`${descricao} - R$ ${valor}`, 20, y);

        y += 7;

    });

    y += 10;

    doc.line(20, y, 190, y);

    y += 10;

    doc.setFontSize(14);
    doc.text("TOTAL: R$ " + total, 20, y);

    y += 20;

    doc.setFontSize(11);
    doc.text("__________________________________", 20, y);
    doc.text("Assinatura do Cliente", 20, y + 6);

    y += 20;

    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(12);
    doc.text("Observações Técnicas:", 20, y);

    y += 6;

    doc.setFontSize(10);

    const linhas = doc.splitTextToSize(
        observacoes || "Nenhuma observação informada.",
        170
    );

    doc.text(linhas, 20, y);

    doc.save("ordem-servico-" + numeroOS + ".pdf");
};

window.editarOS = async function (id) {

    const q = await getDocs(collection(db, "ordens"));

    q.forEach(docSnap => {

        if (docSnap.id === id) {

            const os = docSnap.data();

            idEditando = id;

            document.getElementById("numeroOS").innerText = os.numeroOS;
            document.getElementById("dataAtual").innerText = os.data;
            document.getElementById("observacoes").value = os.observacoes || "";

            nome.value = os.nome;
            telefone.value = os.telefone;
            endereco.value = os.endereco;
            placa.value = os.placa;
            km.value = os.km;
            marca.value = os.marca || "";

            document.getElementById("servicos").innerHTML = "";

            os.servicos.forEach(servico => {

                const div = document.createElement("div");

                div.innerHTML = `
                <input type="text" value="${servico.descricao}">
                <input type="number" value="${servico.valor}" oninput="calcularTotal()">
                <button onclick="this.parentElement.remove(); calcularTotal();" class="btn-remove">X</button>
                `;

                document.getElementById("servicos").appendChild(div);

            });

            calcularTotal();

            fecharHistorico();

        }

    });

};