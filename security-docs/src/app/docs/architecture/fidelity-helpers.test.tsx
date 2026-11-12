import {expect,test} from 'bun:test';
import {assertFigureDefinitions} from './fidelity-helpers';

function fixture(definition?: string) {
 const section=document.createElement('section');
 const figure=document.createElement('div');figure.className='mermaid-target';figure.id='mm0';
 if(definition!==undefined)figure.setAttribute('data-definition',definition);
 section.append(figure);return section;
}
test('ID-based diagrams validate their exact definitions without data-diagram attributes',()=>{
 expect(()=>assertFigureDefinitions(fixture('flowchart TD\nA-->B'),new Map([['mm0','flowchart TD\nA-->B']]))).not.toThrow();
 expect(()=>assertFigureDefinitions(fixture('changed'),new Map([['mm0','original']]))).toThrow();
});
test('an unknown diagram ID expects a missing definition rather than accepting arbitrary source',()=>{
 expect(()=>assertFigureDefinitions(fixture(),new Map())).not.toThrow();
 expect(()=>assertFigureDefinitions(fixture('unexpected'),new Map())).toThrow();
});
