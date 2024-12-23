// eslint-disable
// @ts-nocheck
// This file was generated by lezer-generator. You probably shouldn't edit it.
import { LRParser } from '@lezer/lr'

const spec_Identifier = { __proto__: null, embedding: 64, artist: 68 }
export const parser = LRParser.deserialize({
    version: 14,
    states: "%vQVQPOOOVQPO'#C^OVQPO'#CaO}QPO'#CfO!SQPO'#CgO!XQPO'#CiOOQO'#Cr'#CrOOQO'#Cn'#CnQVQPOOO!aQPO'#CbO!aQPO'#CeO!iQPO'#C_O!vQPO,58xO#OQPO,58{O!aQPO,59QO#TQPO,59ROOQO'#Cj'#CjOOQO,59T,59TOOQO-E6l-E6lOOQO'#C}'#C}O#]QPO,58|OOQO,59P,59POOQO1G.d1G.dO#eQQO1G.dOOQO1G.g1G.gOOQO1G.l1G.lOOQO'#Ch'#ChOOQO1G.m1G.mOOQO1G.h1G.hO#jQQO1G.hO#oQPO7+$OO#tQQO7+$SOOQO<<Gj<<GjOOQO<<Gn<<GnO#|QQO<<GnO$RQPOAN=YOOQOG22tG22t",
    stateData:
        '$]~OeOS~OVUOWUO_UO`UOaUOgPOjQOlXOoYOpROrSOsTO~Oh^O~Oh_O~OV`OW`O~OVcOWcO~OhRXiRXkRX~PVOhgOifO~OkhO~OVjOWjO~OhmOnlO~OSnO~OSoO~OipO~OmrOnqO~OSsO~OntO~Oa`V`~',
    goto: '!srPPszPssPPsss!Qs!TPPP!WPPP!cPPPPPPPPPP!jZUOPQWZQ[PR]QRk_RaTQWOSZPQTbWZZVOPQWZQdXQeYRi^',
    nodeNames:
        '⚠ Prompt WeightedExpression Content Number Permutations Lora Identifier String Wildcard Embedding Artist ArtistName Tag TagName Separator Break Comment',
    maxTerm: 35,
    nodeProps: [['group', -12, 2, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 'Expression']],
    skippedNodes: [0],
    repeatNodeCount: 1,
    tokenData:
        ",c~RpX^#Vpq#Vrs#zuv$ixy$nyz$s|}$x}!O%P!O!P&]!P!Q%n!Q![&]![!]&|!]!^'R!^!_'j!`!a(_!a!b(d!c!}%n#O#P%n#R#S%n#T#U%n#U#V(i#V#o%n#o#p,X#q#r,^#y#z#V$f$g#V#BY#BZ#V$IS$I_#V$I|$JO#V$JT$JU#V$KV$KW#V&FU&FV#V~#[Ye~X^#Vpq#V#y#z#V$f$g#V#BY#BZ#V$IS$I_#V$I|$JO#V$JT$JU#V$KV$KW#V&FU&FV#V~#}TOr#zrs$^s;'S#z;'S;=`$c<%lO#z~$cOW~~$fP;=`<%l#z~$nOs~~$sOg~~$xOi~R%POmQ_PR%UWVP}!O%n!O!P&]!P!Q%n!Q![&]!c!}%n#O#P%n#R#S%n#T#o%nP%sWVP}!O%n!O!P%n!P!Q%n!Q![%n!c!}%n#O#P%n#R#S%n#T#o%nR&dWSQVP}!O%n!O!P&]!P!Q%n!Q![&]!c!}%n#O#P%n#R#S%n#T#o%n~'ROh~~'WSa~OY'RZ;'S'R;'S;=`'d<%lO'R~'gP;=`<%l'R~'mP#`#a'p~'sP#c#d'v~'yP#f#g'|~(PP#T#U(S~(VP![!](Y~(_Ol~~(dOn~~(iOo~~(nYVP}!O%n!O!P%n!P!Q%n!Q![%n!c!}%n#O#P%n#R#S%n#T#f%n#f#g)^#g#o%n~)cYVP}!O%n!O!P%n!P!Q%n!Q![%n!c!}%n#O#P%n#R#S%n#T#X%n#X#Y*R#Y#o%n~*WXVP}!O%n!O!P%n!P!Q%n!Q![%n!c!}%n#O#P%n#R#S%n#T#U*s#U#o%n~*xYVP}!O%n!O!P%n!P!Q%n!Q![%n!c!}%n#O#P%n#R#S%n#T#_%n#_#`+h#`#o%n~+oW`~VP}!O%n!O!P%n!P!Q%n!Q![%n!c!}%n#O#P%n#R#S%n#T#o%n~,^Oj~~,cOk~",
    tokenizers: [0, 1],
    topRules: { Prompt: [0, 1] },
    specialized: [{ term: 7, get: (value): any => spec_Identifier[value] || -1 }],
    tokenPrec: 146,
})
