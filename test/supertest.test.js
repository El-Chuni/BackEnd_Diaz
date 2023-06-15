import chai from "chai";
import supertest from "supertest";
import __dirname from "../src/utils";

const expect = chai.expect
const requester = supertest(__dirname);

describe("Testing BackEnd Project App", () => {
    describe("Testing Products Api", () => {
        before(async () => {
            const testLogin = {
                email: 'eltest@testeador.com',
                password: 'test'
            };

            try {
                const response = await requester.post('/api/user/post/login').send(testLogin);
            
                if (response.status !== 200) {
                  throw new Error('Failed to login before tests');
                }
            
            } catch (error) {
                console.error('Failed to login before tests:', error);
            }
        });
        it("Crear Producto: El API /api/products/post debe crear un producto correctamente si lo recibe desde un usuario premium o admin", async () =>{
            //Given:
            const productMock = {
                title: "Yakuza 8",
                description: "La rima te abrocho",
                price: 59.99,
                thumbnail: "no",
                stock: 100,
                category: "multi-console"
            };

            //Then:
            const {
                statusCode,
                ok,
                _body
            } = (await requester.post('/api/products/post')).setEncoding(productMock);
            console.log(statusCode);
            console.log(ok);
            console.log(_body);

            //Assert that:
            expect(statusCode).is.eqls(201);
            expect(_body.payload).is.ok.and.to.have.property('_id');
            expect(_body.payload).to.have.property('_status').and.that.is.eqls("true");
        }); 

        it("Crear producto incompleto: El API /api/products/post debe crear un estado 400 con error", async () =>{
            //Given:
            const productMock = {
                description: "La rima te abrocho",
                price: 59.99,
                thumbnail: "no",
                category: "multi-console"
            };

            //Then:
            const {
                statusCode,
                ok,
                _body
            } = (await requester.post('/api/products/post')).setEncoding(productMock)
            console.log(statusCode);
            console.log(ok);
            console.log(_body);

            //Assert that:
            expect(statusCode).is.eqls(400);
            expect(_body.payload).is.ok.and.to.have.property('error');
            expect(_body.payload).to.have.property('status');
        }); 

        it("Pillar una lista de productos: Debe poder generarse una lista de productos de DB o FileSystem.", async ()=>{
            //Given:
            

            //Then:
            const {
                statusCode,
                ok,
                _body
            } = (await requester.post('/api/products/')).setEncoding(productMock)

            //Assert that:
            expect(statusCode).to.equal(200);
            expect(ok).to.be.true;
            expect(_body).to.be.an('array');
            expect(_body).to.be.greaterThan(0);
        });
    });

    describe("Testing Carts Api", () => {
        before(async () => {
            const testLogin = {
                email: 'eltest@testeador.com',
                password: 'test'
            };

            try {
                const response = await requester.post('/api/user/post/login').send(testLogin);
            
                if (response.status !== 200) {
                  throw new Error('Failed to login before tests');
                }
            
            } catch (error) {
                console.error('Failed to login before tests:', error);
            }
        });
        it("Crear Carrito Vacio: El API /api/carts/post debe crear un carrito", async () =>{
            //Given:
            const cartMock = {
                products: []
            };

            //Then:
            const {
                statusCode,
                ok,
                _body
            } = (await requester.post('/api/carts/post')).setEncoding(cartMock);
            console.log(statusCode);
            console.log(ok);
            console.log(_body);

            //Assert that:
            expect(statusCode).is.eqls(201);
            expect(_body.payload).is.ok.and.to.have.property('_id');
            expect(_body.payload).to.have.property('_products').and.that.is.eqls([]);
        }); 

        it("Mirar Carritos: El API /api/carts/get debe conseguir todos los carritos existentes", async () =>{
            //Given:

            //Then:
            const {
                statusCode,
                ok,
                _body
            } = (await requester.get('/api/carts/get'))

            console.log(statusCode);
            console.log(ok);
            console.log(_body);

            //Assert that:
            expect(statusCode).to.eql(200);
            expect(_body).to.be.an('array');
            expect(_body.length).to.be.greaterThan(0);
        }); 

        it("Mirar Cierto Carrito: El API /api/carts/get/:cid debe buscar un carrito en particular", async ()=>{
            //Given:
            const cid = '640e2ce5ded1ee4b120a4969';

            //Then:
            const {
                statusCode,
                ok,
                _body
            } = (await requester.get(`/api/carts/get/${cid}`))

            //Assert that:
            expect(statusCode).to.eql(200);
            expect(_body.payload).is.ok.and.to.have.property('_id');
        });
    });

    describe("Testing login and session with Cookies:", () => {
        before(function(){
            this.cookie;
            this.mockUser = {
                first_name: "Mamuma",
                last_name: "Memuma",
                email: "Mimama",
                password: "Mameme",
                age: 22
            };
        });

        //Aclaración: Session se usa para saludar si el usuario está conectado, yo en su lugar uso User.

        it("Test Registro Usuario: Debe poder registrar correctamente un usuario", async () => {
            //Given:
            console.log(this.mockUser);

            //Then:
            const {
                statusCode,
                ok,
                _body
            } = await requester.post('/api/user/post/register').send(mockUser);

            console.log(statusCode);
            console.log(ok);
            console.log(_body);

            //Assert that:
            expect(statusCode).is.eqls(200);
        });

        it("Test Login Usuario: Debe poder hacer login correctamente con el usuario registrado previamente.", async function(){
            //Given:
            const mockLogin = {
                email: this.mockUser.email,
                password: this.mockUser.password
            };
            //Then:
            const result = (await requester.post("/api/user/post/login").send(mockLogin));
            const cookieResult = result.headers['set-cookie'][0];
            //Assert that:
            expect(result.statusCode).is.equal(200);
            const cookieData = cookieResult.split('=');
            this.cookie = {
                name: cookieData[0],
                value: cookieData[1]
            };
            expect(this.cookie.name).to.be.ok.and.eql('Mamuma');
            expect(this.cookie.value).to.be.ok
        });

        it("Test Cambio de Rol rechazado: Debe rechazar el cambiar su rol usuario a premium porque solo un admin puede.", async function(){
            //Given:
            
            //Then:
            const {statusCode} = await requester.get("/api/users/premium").set('Cookie', [`${this.cookie.name}=${this.cookie.value}`]);
            console.log(statusCode);

            //AssertThat:
            expect(statusCode).is.eqls(401);
        });
    });

})