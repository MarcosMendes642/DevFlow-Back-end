const BASE = "http://localhost:3333";

async function post(path, body, token) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify(body),
  });
  let data;
  try { data = await res.json(); } catch { data = await res.text(); }
  return { status: res.status, body: data };
}

(async () => {
  const stamp = Date.now();
  const emailA = `owner_${stamp}@test.com`;
  const emailB = `convidado_${stamp}@test.com`;

  // 1. Criar dois usuários
  const uA = await post("/cadastro", { name: "Owner Teste", email: emailA, senha: "senha123" });
  console.log("[cadastro owner]", uA.status, JSON.stringify(uA.body));
  const uB = await post("/cadastro", { name: "Convidado Teste", email: emailB, senha: "senha123" });
  console.log("[cadastro convidado]", uB.status, JSON.stringify(uB.body));

  const tokenA = uA.body.token;
  if (!tokenA) { console.log("FALHA: sem token do owner"); return; }

  // 2. Owner cria um time
  const t = await post("/time/criarTime", { nome: "Time Teste" }, tokenA);
  console.log("[criarTime]", t.status, JSON.stringify(t.body));
  const teamId = t.body?.team?.tm_id;
  if (!teamId) { console.log("FALHA: sem id do time"); return; }

  // 3. Owner adiciona o convidado ao time (rota em teste)
  const add = await post(`/time/adduser/${teamId}`, { email: emailB, role: "member" }, tokenA);
  console.log("[adduser RESULTADO]", add.status, JSON.stringify(add.body));
})();
