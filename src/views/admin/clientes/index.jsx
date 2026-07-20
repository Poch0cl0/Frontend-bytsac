import React, { useEffect, useState } from "react";

import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import Card from "components/card/Card";
import api from "services/api";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");
  const [clienteEditando, setClienteEditando] = useState(null);

  const [form, setForm] = useState({
    razon_social: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    estado: "activo",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clients");
      setClientes(response.data.data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      razon_social: "",
      ruc: "",
      direccion: "",
      telefono: "",
      email: "",
      estado: "activo",
    });

    setClienteEditando(null);
    setError("");
  };

  const abrirModalNuevo = () => {
    limpiarFormulario();
    onOpen();
  };

  const abrirModalEditar = (cliente) => {
    setClienteEditando(cliente);

    setForm({
      razon_social: cliente.razon_social || "",
      ruc: cliente.ruc || "",
      direccion: cliente.direccion || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      estado: cliente.estado || "activo",
    });

    setError("");
    onOpen();
  };

  const cerrarModal = () => {
    limpiarFormulario();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const buildPayload = () => ({
    razon_social: form.razon_social.trim(),
    ruc: form.ruc.trim() || null,
    direccion: form.direccion.trim() || null,
    telefono: form.telefono.trim() || null,
    email: form.email.trim(),
    estado: form.estado || "activo",
  });

  const mensajeErrorGuardado = (error) => {
    if (!error.response) {
      return "No hay conexión con el API. Confirma que Laravel corre en el puerto 8001 y reinicia el frontend.";
    }

    if (error.response.status === 401) {
      return "Tu sesión expiró. Vuelve a iniciar sesión.";
    }

    if (error.response.status === 403) {
      return "No tienes permiso para realizar esta acción. Usa admin@bytsac.pe o comercial@bytsac.pe.";
    }

    const errors = error.response.data?.errors;
    if (errors && typeof errors === "object") {
      return Object.values(errors).flat().join(" ");
    }

    return (
      error.response.data?.message ||
      "No se pudo guardar el cliente. Revisa los datos e inténtalo de nuevo."
    );
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    const payload = buildPayload();

    try {
      if (clienteEditando) {
        await api.put(`/clients/${clienteEditando.id}`, payload);

        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente fueron actualizados correctamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        await api.post("/clients", payload);

        toast({
          title: "Cliente registrado",
          description: "El cliente fue creado correctamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }

      cerrarModal();
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setError(mensajeErrorGuardado(error));
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCliente = async (cliente) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar al cliente "${cliente.razon_social}"?`
    );

    if (!confirmar) return;

    setEliminando(true);

    try {
      await api.delete(`/clients/${cliente.id}`);

      toast({
        title: "Cliente eliminado",
        description: "El cliente fue eliminado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      cargarClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);

      toast({
        title: "No se pudo eliminar",
        description:
          error.response?.status === 403
            ? "No tienes permiso para eliminar clientes."
            : "Revisa si el cliente tiene suscripciones asociadas.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex mb="24px" justify="space-between" align="center">
          <Box>
            <Text color={textColor} fontSize="22px" fontWeight="700">
              Gestión de Clientes
            </Text>
            <Text color="gray.500" fontSize="sm">
              Lista de clientes registrados en la plataforma BYTSAC.
            </Text>
          </Box>

          <Button variant="brand" onClick={abrirModalNuevo}>
            Nuevo Cliente
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" py="40px">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" color="gray.500" mb="24px">
              <Thead>
                <Tr>
                  <Th borderColor={borderColor}>Razón Social</Th>
                  <Th borderColor={borderColor}>RUC</Th>
                  <Th borderColor={borderColor}>Teléfono</Th>
                  <Th borderColor={borderColor}>Correo</Th>
                  <Th borderColor={borderColor}>Estado</Th>
                  <Th borderColor={borderColor}>Acciones</Th>
                </Tr>
              </Thead>

              <Tbody>
                {clientes.map((cliente) => (
                  <Tr key={cliente.id}>
                    <Td borderColor={borderColor}>
                      <Text color={textColor} fontSize="sm" fontWeight="700">
                        {cliente.razon_social}
                      </Text>
                    </Td>

                    <Td borderColor={borderColor}>
                      <Text fontSize="sm">{cliente.ruc}</Text>
                    </Td>

                    <Td borderColor={borderColor}>
                      <Text fontSize="sm">{cliente.telefono}</Text>
                    </Td>

                    <Td borderColor={borderColor}>
                      <Text fontSize="sm">{cliente.email}</Text>
                    </Td>

                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={
                          cliente.estado === "activo"
                            ? "green"
                            : cliente.estado === "suspendido"
                            ? "orange"
                            : "red"
                        }
                        borderRadius="8px"
                        px="10px"
                        py="4px"
                      >
                        {cliente.estado}
                      </Badge>
                    </Td>

                    <Td borderColor={borderColor}>
                      <HStack spacing="8px">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => abrirModalEditar(cliente)}
                        >
                          Editar
                        </Button>

                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          isLoading={eliminando}
                          onClick={() => eliminarCliente(cliente)}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Card>

      <Modal isOpen={isOpen} onClose={cerrarModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="20px">
          <form onSubmit={guardarCliente}>
            <ModalHeader>
              {clienteEditando ? "Editar cliente" : "Registrar nuevo cliente"}
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              {error && (
                <Alert status="error" borderRadius="12px" mb="20px">
                  <AlertIcon />
                  <Text fontSize="sm">{error}</Text>
                </Alert>
              )}

              <FormControl mb="16px" isRequired>
                <FormLabel>Razón social</FormLabel>
                <Input
                  name="razon_social"
                  value={form.razon_social}
                  onChange={handleChange}
                  placeholder="Ejemplo: Empresa Demo SAC"
                />
              </FormControl>

              <FormControl mb="16px">
                <FormLabel>RUC (opcional)</FormLabel>
                <Input
                  name="ruc"
                  value={form.ruc}
                  onChange={handleChange}
                  placeholder="Ejemplo: 20601234567"
                  maxLength={11}
                />
              </FormControl>

              <FormControl mb="16px">
                <FormLabel>Dirección</FormLabel>
                <Input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ejemplo: Av. América Norte 123"
                />
              </FormControl>

              <FormControl mb="16px">
                <FormLabel>Teléfono</FormLabel>
                <Input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Ejemplo: 987654321"
                />
              </FormControl>

              <FormControl mb="16px" isRequired>
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="cliente@empresa.com"
                />
              </FormControl>

              <FormControl mb="16px">
                <FormLabel>Estado</FormLabel>
                <Select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </Select>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" me="12px" onClick={cerrarModal}>
                Cancelar
              </Button>

              <Button
                variant="brand"
                type="submit"
                isLoading={guardando}
                loadingText="Guardando..."
              >
                {clienteEditando ? "Actualizar cliente" : "Guardar cliente"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}