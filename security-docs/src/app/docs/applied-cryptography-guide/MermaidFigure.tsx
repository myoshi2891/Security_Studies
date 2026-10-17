export function MermaidFigure({id,source}:{id:string;source:string}) {return <div className="diagram" id={`diagram-${id.slice(1)}`} data-diagram={id} data-definition={source} />; }
