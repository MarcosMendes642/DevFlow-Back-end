const { error } = require("node:console");
const prisma = require("../prisma");

async function criarTime(req, res) {
  const { nome } = req.body;
  const usuid = Number(req.user.id);

  if (!nome || nome.trim() === "")
    return res.status(400).json({ error: "O nome é obrigatorio" });

  try {
    const team = await prisma.$transaction(async (tx) => {
      const novoTime = await tx.team.create({
        data: { tm_nome: nome.trim() },
      });
      await tx.team_member.create({
        data: {
          tm_id_tmm: novoTime.tm_id,
          usu_id_tmm: usuid,
          tmm_role: "owner",
        },
      });
      return novoTime;
    });
    return res.status(201).json({
      message: "Time criado",
      team: {
        tm_id: Number(team.tm_id),
        tm_nome: team.tm_nome,
        tm_created_at: team.tm_created_at,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar time" });
  }
}

async function buscarUsuariosDoTime(req, res) {
  const { id } = req.params;

  let timeId;
  try {
    timeId = BigInt(id);
  } catch (error) {
    return res.status(400).json({ error: "ID do time inválido." });
  }

  try {
    const users = await prisma.usuario.findMany({
      where: { team_member: { some: { tm_id_tmm: timeId } } },
      select: {
        usu_id: true,
        usu_name: true,
        usu_email: true,
        usu_avatar_url: true,
        team_member: {
          where: { tm_id_tmm: timeId },
          select: { tmm_role: true },
        },
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar usuários do time." });
  }
}

async function adicionarMembro(req, res) {
  const{id} = req.params;
  const{email, role} = req.body;

  let timeId;
  try{
    timeId= BigInt(id);
  }catch {return res.status(400).json({error: "ID do time invalido"})}
  
  if(!email || email.trim()===""){
    return res.status(400).json({error: "O email é obrigatorio"})
  }

  const rolesPermitidas = ["admin", "member"];
  const novaRole = role ?? "member";
  if(!rolesPermitidas.includes(novaRole)){
    return res.status(400).json({error: "Role invalida. Use admin ou member"})
  }

  try{
    const solicitante = await prisma.team_member.findUnique({
      where: {
        tm_id_tmm_usu_id_tmm: {
          tm_id_tmm: timeId,
          usu_id_tmm: BigInt(req.user.id),
      },
      }
    })
    if(!solicitante || !["owner", "admin"].includes(solicitante.tmm_role)){
      return res.status(403).json({ error: "Apenas owner ou admin podem adicionar membros." });
    }

    
    const usuario = await prisma.usuario.findUnique({
      where: { usu_email: email.trim().toLowerCase() },
      select: { usu_id: true, usu_name: true, usu_email: true, usu_avatar_url: true },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    
    await prisma.team_member.create({
      data: {
        tm_id_tmm: timeId,
        usu_id_tmm: usuario.usu_id,
        tmm_role: novaRole,
      },
    });

    return res.status(201).json({
      message: "Membro adicionado",
      membro: { ...usuario, tmm_role: novaRole },
    });
  } catch (error) {
    
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Este usuário já faz parte do time." });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro ao adicionar membro." });
  }
}
// Detalhes do time (com membros)
//Edita o nome (só owner)
//Apaga o time (só owner)

//Remove membro
module.exports = { criarTime, buscarUsuariosDoTime, adicionarMembro};
