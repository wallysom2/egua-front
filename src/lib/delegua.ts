import { Lexador, AvaliadorSintatico, InterpretadorComDepuracao } from '@designliquido/delegua';

// Função auxiliar para formatar mensagens de erro de forma consistente
function formatarMensagemErro(
  tipoErro: string, 
  erro: any, 
  mensagemPadrao: string,
  incluirLinhaNoFinal: boolean = false
): string {
  const linha = (erro.linha !== undefined && erro.linha !== null) ? String(erro.linha) : 'desconhecida';
  const mensagem = (erro.mensagem && String(erro.mensagem).trim() !== '') 
    ? String(erro.mensagem).trim() 
    : mensagemPadrao;

  if (incluirLinhaNoFinal) {
    let msg = `${tipoErro}: ${mensagem}`;
    // Adiciona a linha apenas se for conhecida e não 'desconhecida'
    if (erro.linha !== undefined && erro.linha !== null) {
        msg += ` (linha ${linha})`;
    }
    return msg;
  }
  return `${tipoErro} na linha ${linha}: ${mensagem}`;
}

export async function executarCodigo(codigo: string): Promise<string[]> {
  const saida: string[] = [];
  
  try {
    if (!codigo || codigo.trim() === '') {
      return ['Por favor, insira algum código para executar.'];
    }

    const lexador = new Lexador();
    const avaliadorSintatico = new AvaliadorSintatico();
    
    const interpretador = new InterpretadorComDepuracao(
      process.cwd(), 
      (saidaChamada: any) => { 
        saida.push(String(saidaChamada));
      },
      (saidaChamada: any) => { 
        if (saida.length > 0 && !saida[saida.length - 1].endsWith('\n')) {
            saida[saida.length - 1] += String(saidaChamada);
        } else {
            saida.push(String(saidaChamada));
        }
      }
    );

    interpretador.interfaceEntradaSaida = {
      question: async (mensagem: string) => {
        console.log(`Pergunta do sistema: ${mensagem}`);
        return Promise.resolve('');
      },
      write: (texto: string) => {
        saida.push(texto);
      }
    };

    // Dividir o código em linhas e remover linhas vazias
    const linhasDoCodigo = codigo
      .split('\n')
      .map(linha => linha.trim())
      .filter(linha => linha !== '');

    if (linhasDoCodigo.length === 0) {
      return ['Por favor, insira algum código para executar.'];
    }
    
    const hashArquivo = 0; // Adicionando hashArquivo

    const resultadoLexador = lexador.mapear(linhasDoCodigo, hashArquivo); // Passando hashArquivo
    
    if (resultadoLexador.erros.length > 0) {
      return resultadoLexador.erros.map(erro =>
        formatarMensagemErro('Erro léxico', erro, 'Detalhe não especificado pelo lexador')
      );
    }

    const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador, hashArquivo); // Passando hashArquivo
    
    if (resultadoAvaliadorSintatico.erros.length > 0) {
      return resultadoAvaliadorSintatico.erros.map(erro => 
        formatarMensagemErro('Erro sintático', erro, 'Detalhe não especificado pelo avaliador sintático')
      );
    }

    const retornoInterpretador = await interpretador.interpretar(
      resultadoAvaliadorSintatico.declaracoes,
      false
    );

    if (retornoInterpretador.erros && retornoInterpretador.erros.length > 0) {
      return retornoInterpretador.erros.map(erro => 
        formatarMensagemErro('Erro de execução', erro, 'Detalhe não especificado pelo interpretador', true)
      );
    }

    return saida.length > 0 ? saida : ['Código executado com sucesso!'];
    
  } catch (erro: any) {
    // Log detalhado do erro no console do servidor para depuração
    console.error("Erro crítico durante a execução do código:", erro);

    let mensagemDetalhada = 'Ocorreu um erro inesperado durante a execução.';
    if (erro instanceof Error) {
        mensagemDetalhada = (erro.message && erro.message.trim() !== '') ? erro.message.trim() : 'Erro interno do servidor.';
        if (erro.stack) {
            console.error("Pilha de erro completa (catch geral):", erro.stack);
        }
    } else if (typeof erro === 'string' && erro.trim() !== '') {
        mensagemDetalhada = erro.trim();
    } else if (erro && erro.mensagem && String(erro.mensagem).trim() !== '') {
        mensagemDetalhada = String(erro.mensagem).trim();
    }

    return [`Erro crítico na execução: ${mensagemDetalhada}`];
  }
} 