test('Devo conhecer as principais assertivas do jest', () => {
    let number = null;

    expect(number).toBeNull();

    number = 10;
    expect(number).not.toBeNull();
    expect(number).toBe(10);
    expect(number).toEqual(10);
    expect(number).toBeGreaterThan(9);
});

test('Devo saber trabalhar com objetos', () => {
    const obj = { name: 'jhon', mail: 'jhon@mail.com' };

    expect(obj).toHaveProperty('name', 'jhon');
    expect(obj.name).toBe('jhon');

    const obj2 = { name: 'jhon', mail: 'jhon@mail.com' };
    expect(obj).toStrictEqual(obj2);
});
