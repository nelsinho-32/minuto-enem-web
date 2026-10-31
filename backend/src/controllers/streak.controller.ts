import { Request, Response } from 'express';
import { PrismaClient, Prisma, StreakDayStatus } from '@prisma/client';

const prisma = new PrismaClient();

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Normaliza uma data para meia-noite UTC (YYYY-MM-DDT00:00:00.000Z)
 * respeitando o fuso horário do Brasil (America/Sao_Paulo).
 */
export function getNormalizedDate(date: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(date); // Formato YYYY-MM-DD
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/**
 * Calcula a diferença exata em dias inteiros entre duas datas normalizadas.
 */
function diffInDays(dateA: Date, dateB: Date): number {
  const utcA = Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate());
  const utcB = Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate());
  return Math.floor((utcA - utcB) / MS_PER_DAY);
}

/**
 * Adiciona N dias a uma data UTC normalizada.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * LÓGICA DO GELINHO (Validação preguiçosa no Login / Abertura do App ou via Cronjob):
 * Verifica se o usuário perdeu dias desde `lastStudyDate` até ontem.
 * - Se perdeu dias e possui `iceFreezes` suficientes, consome 1 gelinho por dia perdido,
 *   cria os registros `FROZEN` no `StreakLog` e mantém o `currentStreak`.
 * - Se não possui `iceFreezes` suficientes, zera o `currentStreak`.
 */
export async function reconcileUserStreak(
  tx: Prisma.TransactionClient,
  userId: string,
  today: Date = getNormalizedDate()
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  // Se nunca estudou ou ofensiva já está zerada, nada a congelar
  if (!user.lastStudyDate || user.currentStreak === 0) {
    return user;
  }

  const lastDate = new Date(user.lastStudyDate);
  const daysSinceLastActivity = diffInDays(today, lastDate);

  // Se estudou hoje (0) ou ontem (1), a ofensiva continua ativa sem precisar de gelinho
  if (daysSinceLastActivity <= 1) {
    return user;
  }

  // Quantidade de dias inteiros perdidos entre lastStudyDate e hoje
  const missedDays = daysSinceLastActivity - 1;

  if (user.iceFreezes >= missedDays) {
    // Consome 1 gelinho para cada dia não estudado e registra no histórico para exibir 🧊 no calendário
    for (let i = 1; i <= missedDays; i++) {
      const frozenDate = addDays(lastDate, i);
      await tx.streakLog.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: frozenDate,
          },
        },
        update: {},
        create: {
          userId: user.id,
          date: frozenDate,
          status: StreakDayStatus.FROZEN,
        },
      });
    }

    const yesterday = addDays(today, -1);

    // Atualiza o lastStudyDate para ontem (último dia coberto pelo gelo) e desconta os gelinhos
    return await tx.user.update({
      where: { id: user.id },
      data: {
        iceFreezes: { decrement: missedDays },
        lastStudyDate: yesterday,
      },
    });
  } else {
    // Não há gelinhos suficientes para cobrir o hiato: zera a ofensiva atual
    return await tx.user.update({
      where: { id: user.id },
      data: {
        currentStreak: 0,
      },
    });
  }
}

/**
 * Controller: Concluir Aula / Sessão de Estudo
 * Rota: POST /api/streak/complete-lesson
 */
export async function completeLessonController(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'O campo userId é obrigatório.' });
    }

    const today = getNormalizedDate();

    const updatedData = await prisma.$transaction(async (tx) => {
      // 1. Primeiro reconcilia possíveis dias anteriores perdidos usando gelinhos (se houver)
      const user = await reconcileUserStreak(tx, userId, today);

      // 2. Verifica se já existe registro no dia de hoje
      const existingTodayLog = await tx.streakLog.findUnique({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
      });

      // Se já bateu a meta hoje, apenas retorna o estado atual (idempotente)
      if (existingTodayLog && existingTodayLog.status === StreakDayStatus.COMPLETED) {
        return user;
      }

      // 3. Calcula a nova ofensiva
      let newStreak = 1;
      if (user.lastStudyDate) {
        const diff = diffInDays(today, new Date(user.lastStudyDate));
        if (diff === 1) {
          // Estudou ontem OU ontem foi salvo por gelinho
          newStreak = user.currentStreak + 1;
        } else if (diff === 0) {
          newStreak = Math.max(1, user.currentStreak);
        }
      }

      const newLongestStreak = Math.max(user.longestStreak, newStreak);

      // 4. Registra o dia de hoje como COMPLETED (🔥)
      await tx.streakLog.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          status: StreakDayStatus.COMPLETED,
        },
        create: {
          userId,
          date: today,
          status: StreakDayStatus.COMPLETED,
        },
      });

      // 5. Atualiza os contadores no usuário
      return await tx.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastStudyDate: today,
        },
      });
    });

    return res.status(200).json({
      message: 'Aula concluída e ofensiva atualizada com sucesso!',
      streak: {
        currentStreak: updatedData.currentStreak,
        longestStreak: updatedData.longestStreak,
        lastStudyDate: updatedData.lastStudyDate,
        iceFreezes: updatedData.iceFreezes,
      },
    });
  } catch (error: any) {
    console.error('[StreakController] Erro ao atualizar ofensiva:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
  }
}

/**
 * Controller: Validação de Login / Buscar Calendário da Semana
 * Rota: GET /api/streak/:userId/week
 */
export async function getWeeklyStreakController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const today = getNormalizedDate();

    const result = await prisma.$transaction(async (tx) => {
      // Executa a validação do gelinho no momento do login/abertura do app
      const user = await reconcileUserStreak(tx, userId, today);

      // Calcula o início (Domingo) e fim (Sábado) da semana atual
      const dayOfWeek = today.getUTCDay(); // 0 = Domingo, 6 = Sábado
      const startOfWeek = addDays(today, -dayOfWeek);
      const endOfWeek = addDays(startOfWeek, 6);

      const logs = await tx.streakLog.findMany({
        where: {
          userId,
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

      const logMap = new Map<string, StreakDayStatus>();
      logs.forEach((log) => {
        const key = log.date.toISOString().split('T')[0];
        logMap.set(key, log.status);
      });

      const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
      const weekDays = labels.map((label, idx) => {
        const currentDate = addDays(startOfWeek, idx);
        const dateKey = currentDate.toISOString().split('T')[0];
        const isToday = diffInDays(currentDate, today) === 0;
        const isFuture = diffInDays(currentDate, today) > 0;
        const logStatus = logMap.get(dateKey);

        let status: 'COMPLETED' | 'FROZEN' | 'EMPTY' | 'FUTURE' = 'EMPTY';
        if (logStatus === StreakDayStatus.COMPLETED) {
          status = 'COMPLETED';
        } else if (logStatus === StreakDayStatus.FROZEN) {
          status = 'FROZEN';
        } else if (isFuture) {
          status = 'FUTURE';
        }

        return {
          date: dateKey,
          label,
          status,
          isToday,
        };
      });

      return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        iceFreezes: user.iceFreezes,
        lastStudyDate: user.lastStudyDate,
        weekDays,
      };
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[StreakController] Erro ao buscar ofensiva semanal:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
  }
}

/**
 * Cronjob Diário (ex: rodar às 00:05 via node-cron)
 * Processa em lote todos os usuários que possuem ofensiva ativa mas não estudaram ontem.
 */
export async function runDailyStreakCron() {
  const today = getNormalizedDate();

  const activeUsers = await prisma.user.findMany({
    where: {
      currentStreak: { gt: 0 },
      lastStudyDate: { lt: today },
    },
    select: { id: true },
  });

  for (const u of activeUsers) {
    try {
      await prisma.$transaction(async (tx) => {
        await reconcileUserStreak(tx, u.id, today);
      });
    } catch (err) {
      console.error(`[StreakCron] Falha ao processar usuário ${u.id}:`, err);
    }
  }
}

