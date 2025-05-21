import { Lexador, AvaliadorSintatico, InterpretadorComDepuracao } from '@designliquido/delegua';

export async function executarCodigo(codigo: string): Promise<string[]> {
  const saida: string[] = [];
  // Log para verificar o código recebido
  console.log("Código recebido para execução:", JSON.stringify(codigo));
  
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
        // @ts-ignore
      question: async (mensagem: string, opcoes?: any) => {
        console.log(`Pergunta do sistema (não interativo): ${mensagem}`);
        return Promise.resolve(opcoes?.padrao || ''); 
      },
      write: (texto: string) => {
        saida.push(texto);
      },
      // @ts-ignore
      readline: {
        // @ts-ignore
        question: async (mensagem: string, opcoes?: any) => {
          console.log(`Pergunta (readline - não interativo): ${mensagem}`);
          return Promise.resolve(opcoes?.padrao || '');
        },
        close: () => {}
      }
    };

    // Dividir o código em linhas. O Lexador pode esperar um array de strings.
    const linhasDoCodigo = codigo.split('\n');
    console.log("Linhas do código para o Lexador:", linhasDoCodigo);
    const resultadoLexador = lexador.mapear(linhasDoCodigo);
    
    if (resultadoLexador.erros.length > 0) {
      console.error("Erros do Lexador:", resultadoLexador.erros);
      return resultadoLexador.erros.map(erro => `Erro léxico: ${erro.mensagem}`);
    }

    const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
    
    if (resultadoAvaliadorSintatico.erros.length > 0) {
      console.error("Erros do Avaliador Sintático:", resultadoAvaliadorSintatico.erros);
      return resultadoAvaliadorSintatico.erros.map(erro => `Erro sintático: ${erro.mensagem}`);
    }

    const retornoInterpretador = await interpretador.interpretar(resultadoAvaliadorSintatico.declaracoes, false);

    if (retornoInterpretador.erros && retornoInterpretador.erros.length > 0) {
        console.error("Erros do Interpretador:", retornoInterpretador.erros);
        return retornoInterpretador.erros.map(erro => `Erro de interpretação: ${erro.mensagem}`);
    }

    const saidaFiltrada = saida.filter(linha => linha !== '');
    console.log("Saída final:", saidaFiltrada);
    return saidaFiltrada.length > 0 ? saidaFiltrada : ['Código executado com sucesso! (Nenhuma saída produzida)'];
    
  } catch (erro: any) {
    let mensagemErro = 'Erro desconhecido na execução.';
    if (erro instanceof Error) {
        mensagemErro = erro.message;
        if (erro.stack) {
            console.error("Pilha de erro completa do catch principal (executarCodigo):");
            console.error(erro.stack);
        }
    } else if (typeof erro === 'string') {
        mensagemErro = erro;
    } else {
        try {
            mensagemErro = erro.mensagem || JSON.stringify(erro);
        } catch {
            // Nada a fazer, mensagemErro já tem um valor padrão.
        }
    }
    console.error("Erro capturado no catch principal (executarCodigo):", mensagemErro);
    return [`Erro na execução: ${mensagemErro}`];
  }
} 