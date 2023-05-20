import useP44 from './hooks/useP44';

function App() {
    const p44 = useP44();
    return (
        <div className="column full-block center">
            <h2 className="title m-15">Everscale Banned Addresses [ConfigParam 44]</h2>
            {
                p44.length ? p44.map((address, idx) => {
                    const addrStr = address.toString('raw').toLowerCase();
                    return (
                        <a
                            className="active fs-18"
                            href={`https://everscan.io/accounts/${addrStr}`}
                            target='_blank'
                        >
                            {`${idx} | ${addrStr}`}
                        </a>
                    )
                }) : (<div className="active fs-18" >loading...</div>)
            }
        </div>
    );
}

export default App;
