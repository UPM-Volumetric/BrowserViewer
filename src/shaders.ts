export const pointCloudeVertexShader = `
    precision highp float;
    varying vec3 vColor;

    void main() {
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        float dx = pow(position[0] - cameraPosition[0], 2.0);
        float dy = pow(position[1] - cameraPosition[1], 2.0);
        float dz = pow(position[2] - cameraPosition[2], 2.0);
        float delta  = pow(dx + dy + dz, 0.5);

        gl_PointSize = 1300.0 / delta; // The factor is model dependant
    }
`;

export const pointCloudFragmentShader = `
    precision highp float;
    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
`;
